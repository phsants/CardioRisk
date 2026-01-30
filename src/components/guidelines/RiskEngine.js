// Motor de Regras para Classificação de Risco Cardiovascular
// Baseado na Diretriz Brasileira de Dislipidemias SBC 2025

import {
  RISK_CATEGORIES,
  EXTREME_RISK_CRITERIA,
  VERY_HIGH_RISK_CRITERIA,
  HIGH_RISK_CRITERIA,
  INTERMEDIATE_RISK_CRITERIA,
  RISK_MODIFIERS,
  LIPID_REFERENCE_VALUES,
  CALCULATIONS,
  SCORING_TABLES,
  MOULIN_CHYLOMICRONEMIA_SCORE,
} from "./GuidelineData";

class RiskEngine {
  constructor() {
    this.patientData = {};
    this.lipidData = {};
    this.clinicalData = {};
    this.atheroscleroticData = {};
    this.familyHistoryData = {};
    this.imagingData = {};
  }

  // Carrega todos os dados do paciente
  loadData(data) {
    this.patientData = data.patient || {};
    this.lipidData = data.lipids || {};
    this.clinicalData = data.clinical || {};
    this.atheroscleroticData = data.atherosclerotic || {};
    this.familyHistoryData = data.familyHistory || {};
    this.imagingData = data.imaging || {};
  }

  // Calcula valores derivados
  calculateDerivedValues() {
    const derived = {};

    // IMC
    if (this.patientData.weight && this.patientData.height) {
      derived.bmi = CALCULATIONS.bmi(this.patientData.weight, this.patientData.height);
    }

    // Não-HDL-c
    if (this.lipidData.total_cholesterol && this.lipidData.hdl_c) {
      derived.non_hdl_c = CALCULATIONS.nonHdlC(
        this.lipidData.total_cholesterol,
        this.lipidData.hdl_c
      );
    }

    // ApoB estimado (se não disponível)
    if (!this.lipidData.apo_b && derived.non_hdl_c) {
      derived.estimated_apo_b = CALCULATIONS.estimatedApoB(derived.non_hdl_c);
    }

    // LDL-c por Friedewald (se não medido)
    if (!this.lipidData.ldl_c && this.lipidData.total_cholesterol) {
      derived.friedewald_ldl = CALCULATIONS.friedewaldLdl(
        this.lipidData.total_cholesterol,
        this.lipidData.hdl_c,
        this.lipidData.triglycerides
      );
    }

    // Síndrome Metabólica
    const msCheck = CALCULATIONS.metabolicSyndromeCheck({
      ...this.patientData,
      ...this.lipidData,
      ...this.clinicalData,
    });
    derived.metabolic_syndrome = msCheck;

    // Calcula pontuação de risco e risco percentual em 10 anos
    const riskScore = this.calculateRiskScore();
    if (riskScore !== null) {
      derived.risk_score = riskScore;
      derived.risk_percentage_10y = this.calculateRiskPercentage(riskScore);
    }

    return derived;
  }

  // Calcula pontuação de risco usando SCORING_TABLES
  calculateRiskScore() {
    const patient = this.patientData;
    const clinical = this.clinicalData;
    const lipids = this.lipidData;

    // Verifica se temos dados mínimos necessários
    if (!patient.age || !patient.sex || !lipids.total_cholesterol || !lipids.hdl_c) {
      return null;
    }

    const isFemale = patient.sex === "feminino";
    const tables = isFemale ? SCORING_TABLES.women : SCORING_TABLES.men;
    let totalPoints = 0;

    // Pontos por idade
    const agePoints = this.getPointsForValue(
      patient.age,
      tables.pointAssignment.age,
      (age, range) => {
        if (range === "≥ 75") return age >= 75;
        const [min, max] = range.split("-").map(Number);
        return age >= min && age <= max;
      }
    );
    if (agePoints !== null) totalPoints += agePoints;

    // Pontos por HDL-C
    const hdlPoints = this.getPointsForValue(
      lipids.hdl_c,
      tables.pointAssignment.hdl_c,
      (value, range) => {
        if (range.startsWith("≥")) {
          const threshold = Number(range.replace("≥ ", "").replace(" mg/dL", ""));
          return value >= threshold;
        }
        if (range.startsWith("<")) {
          const threshold = Number(range.replace("< ", "").replace(" mg/dL", ""));
          return value < threshold;
        }
        const [min, max] = range.split(" a ").map(s => Number(s.replace(" mg/dL", "")));
        return value >= min && value <= max;
      }
    );
    if (hdlPoints !== null) totalPoints += hdlPoints;

    // Pontos por colesterol total
    const cholPoints = this.getPointsForValue(
      lipids.total_cholesterol,
      tables.pointAssignment.total_cholesterol,
      (value, range) => {
        if (range.startsWith("<")) {
          const threshold = Number(range.replace("< ", "").replace(" mg/dL", ""));
          return value < threshold;
        }
        if (range.startsWith("≥")) {
          const threshold = Number(range.replace("≥ ", "").replace(" mg/dL", ""));
          return value >= threshold;
        }
        const [min, max] = range.split("-").map(Number);
        return value >= min && value <= max;
      }
    );
    if (cholPoints !== null) totalPoints += cholPoints;

    // Pontos por pressão arterial sistólica
    // Se não houver PAS específica, usa 130 como padrão se tem HAS (conforme diretriz)
    const sbp = clinical.systolic_bp || (clinical.has_hypertension ? 130 : null);
    if (sbp !== null && sbp !== undefined) {
      // Tratada ou não: usa resposta do formulário; se não informado, assume tratado quando tem HAS
      const isTreated = clinical.hypertension_treated !== undefined
        ? clinical.hypertension_treated === true
        : clinical.has_hypertension === true;
      const sbpTable = isTreated 
        ? tables.pointAssignment.sbp_treated 
        : tables.pointAssignment.sbp_untreated;
      
      const sbpPoints = this.getPointsForValue(
        sbp,
        sbpTable,
        (value, range) => {
          if (range.startsWith("<")) {
            const threshold = Number(range.replace("< ", "").replace(" mmHg", ""));
            return value < threshold;
          }
          if (range.startsWith("≥")) {
            const threshold = Number(range.replace("≥ ", "").replace(" mmHg", ""));
            return value >= threshold;
          }
          const [min, max] = range.split(" a ").map(s => Number(s.replace(" mmHg", "")));
          return value >= min && value <= max;
        }
      );
      if (sbpPoints !== null) totalPoints += sbpPoints;
    }

    // Pontos por fumo
    const isSmoker = clinical.is_current_smoker === true;
    const smokingEntry = tables.pointAssignment.smoking.find(s => 
      s.value === (isSmoker ? "Sim" : "Não")
    );
    if (smokingEntry) totalPoints += smokingEntry.points;

    // Pontos por diabetes
    const hasDiabetes = clinical.has_diabetes === true;
    const diabetesEntry = tables.pointAssignment.diabetes.find(d => 
      d.value === (hasDiabetes ? "Sim" : "Não")
    );
    if (diabetesEntry) totalPoints += diabetesEntry.points;

    return totalPoints;
  }

  // Helper para obter pontos baseado em valor e faixa
  getPointsForValue(value, table, comparator) {
    for (const entry of table) {
      if (comparator(value, entry.range || entry.value)) {
        return entry.points;
      }
    }
    return null;
  }

  // Converte pontuação em risco percentual em 10 anos
  calculateRiskPercentage(points) {
    const patient = this.patientData;
    const isFemale = patient.sex === "feminino";
    const tables = isFemale ? SCORING_TABLES.women : SCORING_TABLES.men;

    // Procura o mapeamento correspondente
    for (const mapping of tables.riskMapping) {
      const pointsStr = mapping.points;
      
      if (pointsStr.startsWith("≤")) {
        const threshold = Number(pointsStr.replace("≤ ", ""));
        if (points <= threshold) {
          return this.parseRiskPercentage(mapping.risk);
        }
      } else if (pointsStr.startsWith("≥")) {
        const threshold = Number(pointsStr.replace("≥ ", ""));
        if (points >= threshold) {
          return this.parseRiskPercentage(mapping.risk);
        }
      } else {
        const exactPoints = Number(pointsStr);
        if (points === exactPoints) {
          return this.parseRiskPercentage(mapping.risk);
        }
      }
    }

    // Se não encontrou correspondência exata, interpola ou usa o mais próximo
    // Para valores muito altos ou muito baixos, retorna os extremos
    if (points < -3) return 0.5; // < 1%
    if (points > 20) return 35; // > 30%

    // Interpola linearmente entre os valores mais próximos
    for (let i = 0; i < tables.riskMapping.length - 1; i++) {
      const current = tables.riskMapping[i];
      const next = tables.riskMapping[i + 1];
      
      const currentPoints = this.parsePoints(current.points);
      const nextPoints = this.parsePoints(next.points);
      
      if (points >= currentPoints && points < nextPoints) {
        const currentRisk = this.parseRiskPercentage(current.risk);
        const nextRisk = this.parseRiskPercentage(next.risk);
        const ratio = (points - currentPoints) / (nextPoints - currentPoints);
        return currentRisk + (nextRisk - currentRisk) * ratio;
      }
    }

    return null;
  }

  // Helper para parsear string de pontos
  parsePoints(pointsStr) {
    if (pointsStr.startsWith("≤")) return Number(pointsStr.replace("≤ ", ""));
    if (pointsStr.startsWith("≥")) return Number(pointsStr.replace("≥ ", ""));
    return Number(pointsStr);
  }

  // Helper para parsear string de risco percentual
  parseRiskPercentage(riskStr) {
    if (riskStr.startsWith("<")) return 0.5; // < 1%
    if (riskStr.startsWith(">")) return 35; // > 30%
    return Number(riskStr.replace(",", "."));
  }

  // Calcula escore de Moulin para Quilomicronemia Familiar (SQF)
  calculateMoulinScore() {
    const lipids = this.lipidData;
    const clinical = this.clinicalData;
    
    // Verifica critério de seleção: TG > 885 mg/dL em jejum
    if (!lipids.triglycerides || lipids.triglycerides <= MOULIN_CHYLOMICRONEMIA_SCORE.selection_criteria.tg_threshold) {
      return null; // Não se aplica
    }
    
    // Verifica se está em jejum (requisito do escore)
    if (lipids.fasting !== true) {
      return {
        applicable: false,
        reason: "Escore de Moulin requer amostra em jejum",
        recommendation: "Repetir dosagem de TG em jejum de 12 horas para calcular o escore",
      };
    }
    
    let score = 0;
    const criteriaMet = [];
    const criteriaNotMet = [];
    
    // 1. TG > 885 mg/dL em pelo menos três dosagens consecutivas: +5
    const tgConsecutiveCount = clinical.tg_previous_measurements || 0;
    if (tgConsecutiveCount >= 3) {
      score += 5;
      criteriaMet.push({
        id: "tg_three_consecutive",
        description: "TG > 885 mg/dL em ≥ 3 dosagens consecutivas",
        points: 5,
      });
    } else {
      criteriaNotMet.push({
        id: "tg_three_consecutive",
        description: "TG > 885 mg/dL em ≥ 3 dosagens consecutivas",
        points: 5,
        current: tgConsecutiveCount,
        needed: 3,
      });
    }
    
    // 2. TG > 1.770 mg/dL em pelo menos uma ocasião: +1
    const tgHighest = clinical.tg_highest_value || lipids.triglycerides;
    if (tgHighest > 1770) {
      score += 1;
      criteriaMet.push({
        id: "tg_one_occasion_1770",
        description: "TG > 1.770 mg/dL em pelo menos uma ocasião",
        points: 1,
      });
    } else {
      criteriaNotMet.push({
        id: "tg_one_occasion_1770",
        description: "TG > 1.770 mg/dL em pelo menos uma ocasião",
        points: 1,
        current: tgHighest,
        needed: 1770,
      });
    }
    
    // 3. Valores prévios de TG < 177 mg/dL: -5
    if (clinical.tg_previous_low === true) {
      score += -5;
      criteriaMet.push({
        id: "tg_previous_low",
        description: "Valores prévios de TG < 177 mg/dL",
        points: -5,
      });
    } else {
      criteriaNotMet.push({
        id: "tg_previous_low",
        description: "Valores prévios de TG < 177 mg/dL",
        points: -5,
      });
    }
    
    // 4. Ausência de fatores secundários (exceto gestação e etinilestradiol): +2
    const secondaryFactors = clinical.has_secondary_factors || [];
    const excludedFactors = ["pregnancy", "ethinylestradiol"];
    const hasOnlyExcluded = secondaryFactors.length > 0 && 
      secondaryFactors.every(f => excludedFactors.includes(f));
    const hasNoSecondaryFactors = secondaryFactors.length === 0 || 
      (secondaryFactors.includes("none") && secondaryFactors.length === 1);
    
    if (hasNoSecondaryFactors || hasOnlyExcluded) {
      score += 2;
      criteriaMet.push({
        id: "no_secondary_factors",
        description: "Ausência de fatores secundários (exceto gestação e etinilestradiol)",
        points: 2,
      });
    } else {
      criteriaNotMet.push({
        id: "no_secondary_factors",
        description: "Ausência de fatores secundários (exceto gestação e etinilestradiol)",
        points: 2,
        current: secondaryFactors.filter(f => !excludedFactors.includes(f)),
      });
    }
    
    // 5. História de pancreatite: +1
    if (clinical.has_pancreatitis_history === true) {
      score += 1;
      criteriaMet.push({
        id: "pancreatitis_history",
        description: "História de pancreatite",
        points: 1,
      });
    } else {
      criteriaNotMet.push({
        id: "pancreatitis_history",
        description: "História de pancreatite",
        points: 1,
      });
    }
    
    // 6. Dor abdominal recorrente inexplicada: +1
    if (clinical.recurrent_abdominal_pain === true) {
      score += 1;
      criteriaMet.push({
        id: "recurrent_abdominal_pain",
        description: "Dor abdominal recorrente inexplicada",
        points: 1,
      });
    } else {
      criteriaNotMet.push({
        id: "recurrent_abdominal_pain",
        description: "Dor abdominal recorrente inexplicada",
        points: 1,
      });
    }
    
    // 7. Sem história de hiperlipidemia familiar combinada: +1
    if (clinical.has_combined_familial_hyperlipidemia === false) {
      score += 1;
      criteriaMet.push({
        id: "no_combined_familial_hyperlipidemia",
        description: "Sem história de hiperlipidemia familiar combinada",
        points: 1,
      });
    } else {
      criteriaNotMet.push({
        id: "no_combined_familial_hyperlipidemia",
        description: "Sem história de hiperlipidemia familiar combinada",
        points: 1,
      });
    }
    
    // 8. Sem resposta à terapia hipolipemiante (redução de TG < 20%): +1
    if (clinical.lipid_therapy_response === true) {
      const tgReduction = clinical.tg_reduction_percentage || 0;
      if (tgReduction < 20) {
        score += 1;
        criteriaMet.push({
          id: "no_response_to_therapy",
          description: `Sem resposta à terapia hipolipemiante (redução de TG < 20%: ${tgReduction}%)`,
          points: 1,
        });
      } else {
        criteriaNotMet.push({
          id: "no_response_to_therapy",
          description: "Sem resposta à terapia hipolipemiante (redução de TG < 20%)",
          points: 1,
          current: tgReduction,
        });
      }
    } else {
      criteriaNotMet.push({
        id: "no_response_to_therapy",
        description: "Sem resposta à terapia hipolipemiante (redução de TG < 20%)",
        points: 1,
        note: "Não informado se fez terapia",
      });
    }
    
    // 9. Idade do início dos sintomas
    if (clinical.symptom_onset_age !== undefined && clinical.symptom_onset_age !== null) {
      const age = clinical.symptom_onset_age;
      let agePoints = 0;
      if (age < 10) {
        agePoints = 3;
      } else if (age < 20) {
        agePoints = 2;
      } else if (age < 40) {
        agePoints = 1;
      }
      
      if (agePoints > 0) {
        score += agePoints;
        criteriaMet.push({
          id: "symptom_onset_age",
          description: `Idade do início dos sintomas: ${age} anos`,
          points: agePoints,
        });
      } else {
        criteriaNotMet.push({
          id: "symptom_onset_age",
          description: "Idade do início dos sintomas",
          points: 0,
          current: age,
          note: "Idade ≥ 40 anos não adiciona pontos",
        });
      }
    } else {
      criteriaNotMet.push({
        id: "symptom_onset_age",
        description: "Idade do início dos sintomas",
        points: 0,
        note: "Não informado",
      });
    }
    
    // Interpretação do escore
    let interpretation = "muito_improvável";
    let interpretationLabel = MOULIN_CHYLOMICRONEMIA_SCORE.interpretation.very_improbable.label;
    
    if (score >= MOULIN_CHYLOMICRONEMIA_SCORE.interpretation.very_probable.min) {
      interpretation = "muito_provável";
      interpretationLabel = MOULIN_CHYLOMICRONEMIA_SCORE.interpretation.very_probable.label;
    } else if (score <= MOULIN_CHYLOMICRONEMIA_SCORE.interpretation.improbable.max) {
      interpretation = "improvável";
      interpretationLabel = MOULIN_CHYLOMICRONEMIA_SCORE.interpretation.improbable.label;
    }
    
    return {
      applicable: true,
      score,
      interpretation,
      interpretationLabel,
      tg_value: lipids.triglycerides,
      criteriaMet,
      criteriaNotMet,
      recommendation: interpretation === "muito_provável" 
        ? "Considerar teste genético para confirmação de Quilomicronemia Familiar"
        : interpretation === "improvável"
        ? "Considerar investigação adicional e possível teste genético"
        : "Probabilidade baixa, mas manter vigilância",
    };
  }

  // Verifica critérios de Risco Extremo
  checkExtremeRisk() {
    const criteria = [];
    const atherosclerotic = this.atheroscleroticData;
    const clinical = this.clinicalData;
    const lipids = this.lipidData;

    // Eventos recorrentes em uso de tratamento
    if (atherosclerotic.recurrent_events) {
      criteria.push({
        id: "recurrent_events_on_treatment",
        description: "Eventos cardiovasculares recorrentes",
      });
    }

    // Doença polivascular
    const vascularTerritories = [];
    if (atherosclerotic.myocardial_infarction || atherosclerotic.revascularization) {
      vascularTerritories.push("coronariana");
    }
    if (atherosclerotic.ischemic_stroke) {
      vascularTerritories.push("cerebrovascular");
    }
    if (atherosclerotic.peripheral_artery_disease || atherosclerotic.carotid_stenosis) {
      vascularTerritories.push("periférica");
    }
    if (vascularTerritories.length >= 2) {
      criteria.push({
        id: "polyvascular_disease",
        description: `Doença aterosclerótica em múltiplos territórios: ${vascularTerritories.join(", ")}`,
      });
    }

    // DASC + DM com complicações
    if (atherosclerotic.has_ascvd && clinical.has_diabetes) {
      const hasComplications = clinical.diabetes_complications?.some(c => c !== "none");
      if (hasComplications || (clinical.diabetes_duration_years && clinical.diabetes_duration_years >= 10)) {
        criteria.push({
          id: "ascvd_plus_dm_plus_complications",
          description: "DASC + Diabetes com complicações ou longa duração",
        });
      }
    }

    // Suspeita de HF não altera a categoria de risco (apenas gera aviso na tela de resultados se houver critério forte)

    // LDL persistentemente muito elevado
    if (lipids.ldl_c >= 300) {
      criteria.push({
        id: "ldl_persistently_elevated",
        description: `LDL-c muito elevado (${lipids.ldl_c} mg/dL)`,
      });
    }

    return {
      isExtremeRisk: criteria.length > 0,
      criteria,
    };
  }

  // Verifica critérios de Muito Alto Risco
  checkVeryHighRisk() {
    const criteria = [];
    const atherosclerotic = this.atheroscleroticData;
    const clinical = this.clinicalData;
    const imaging = this.imagingData;
    const familyHistory = this.familyHistoryData;

    // Doença aterosclerótica clínica - só se confirmado
    if (atherosclerotic.has_ascvd === true) {
      criteria.push({
        id: "clinical_ascvd",
        description: "Doença aterosclerótica clínica estabelecida",
      });
    }

    // CAC > 300 UA (Tabela 4.1 - Muito Alto Risco)
    if (imaging.has_cac === true && imaging.cac_score && imaging.cac_score > 300) {
      criteria.push({
        id: "subclinical_atherosclerosis_cac_300",
        description: `CAC > 300 UA (${imaging.cac_score} UA)`,
      });
    }

    // DM2 com EMAR ou ≥ 3 EAR (Tabela 4.1)
    if (clinical.has_diabetes === true) {
      const complications = clinical.diabetes_complications || [];
      const hasRealComplications = Array.isArray(complications) && 
        complications.some(c => c && c !== "none");
      
      // Conta EAR (Estratificadores de Risco) - histórico familiar NÃO conta como EAR (apenas fator a considerar)
      let earCount = 0;
      if (clinical.has_hypertension) earCount++;
      if (clinical.is_current_smoker) earCount++;
      if (this.lipidData.hdl_c && ((this.patientData.sex === "masculino" && this.lipidData.hdl_c < 40) || 
          (this.patientData.sex === "feminino" && this.lipidData.hdl_c < 50))) earCount++;
      
      // EMAR = complicações microvasculares ou DRC
      const hasEMAR = hasRealComplications || 
        (clinical.has_ckd && ["4", "5"].includes(clinical.ckd_stage));
      
      if (hasEMAR || earCount >= 3) {
        criteria.push({
          id: "dm2_with_emar_or_3_ear",
          description: `DM2 com ${hasEMAR ? "EMAR" : "≥ 3 EAR"}`,
        });
      }
    }
    if (imaging.has_carotid_us === true && imaging.carotid_plaque === true) {
      criteria.push({
        id: "subclinical_atherosclerosis_plaque",
        description: "Placa aterosclerótica em carótidas",
      });
    }

    // Suspeita de HF não altera a categoria de risco (apenas gera aviso na tela de resultados se houver critério forte)

    // DM com LOA ou longa duração - só se tem diabetes confirmado
    if (clinical.has_diabetes === true) {
      const complications = clinical.diabetes_complications || [];
      const hasRealComplications = Array.isArray(complications) && 
        complications.some(c => c && c !== "none");
      const longDuration = clinical.diabetes_duration_years && clinical.diabetes_duration_years >= 10;
      
      if (hasRealComplications) {
        criteria.push({
          id: "dm_with_tod",
          description: "Diabetes com complicações microvasculares",
        });
      } else if (longDuration) {
        criteria.push({
          id: "dm_long_duration",
          description: "Diabetes > 10 anos de duração",
        });
      }
    }

    // DRC estágio 4-5 - só se confirmado
    if (clinical.has_ckd === true && clinical.ckd_stage && ["4", "5"].includes(clinical.ckd_stage)) {
      criteria.push({
        id: "ckd_stage_4_5",
        description: `DRC estágio ${clinical.ckd_stage}`,
      });
    }

    return {
      isVeryHighRisk: criteria.length > 0,
      criteria,
    };
  }

  // Verifica critérios de Alto Risco
  checkHighRisk() {
    const criteria = [];
    const clinical = this.clinicalData;
    const lipids = this.lipidData;
    const imaging = this.imagingData;
    const patient = this.patientData;
    const derived = this.calculateDerivedValues();

    // DM sem LOA - só se tem diabetes confirmado
    if (clinical.has_diabetes === true) {
      // Verifica se NÃO tem complicações ou se as complicações são "none"
      const complications = clinical.diabetes_complications || [];
      const hasRealComplications = Array.isArray(complications) && 
        complications.some(c => c && c !== "none");
      
      // Se não foi classificado como muito alto risco (com complicações)
      // então é alto risco (sem complicações)
      if (!hasRealComplications) {
        criteria.push({
          id: "diabetes_without_tod",
          description: "Diabetes mellitus sem lesão de órgão-alvo",
        });
      }
    }

    // DRC estágio 3 - só se tem DRC confirmada
    if (clinical.has_ckd === true && clinical.ckd_stage && ["3a", "3b"].includes(clinical.ckd_stage)) {
      criteria.push({
        id: "ckd_stage_3",
        description: `DRC estágio ${clinical.ckd_stage}`,
      });
    }

    // LDL ≥ 190 - só se o valor foi informado
    if (lipids.ldl_c && lipids.ldl_c >= 190) {
      criteria.push({
        id: "ldl_above_190",
        description: `LDL-c ≥ 190 mg/dL (${lipids.ldl_c} mg/dL)`,
      });
    }

    // Lp(a) > 180 mg/dL (> 390 nmol/L) - Tabela 4.1
    if (lipids.has_lp_a === true && lipids.lp_a_value) {
      const isElevated = lipids.lp_a_unit === "nmol_l" 
        ? lipids.lp_a_value > 390 
        : lipids.lp_a_value > 180;
      if (isElevated) {
        criteria.push({
          id: "lp_a_elevated",
          description: `Lp(a) > ${lipids.lp_a_unit === "nmol_l" ? "390" : "180"} ${lipids.lp_a_unit === "nmol_l" ? "nmol/L" : "mg/dL"} (${lipids.lp_a_value} ${lipids.lp_a_unit === "nmol_l" ? "nmol/L" : "mg/dL"})`,
        });
      }
    }

    // Escore calculado ≥ 20% em 10 anos - Tabela 4.1
    // (derived já calculado acima)
    if (derived.risk_percentage_10y !== null && derived.risk_percentage_10y >= 20) {
      criteria.push({
        id: "score_20_or_more",
        description: `Escore de risco ≥ 20% em 10 anos (${derived.risk_percentage_10y.toFixed(1)}%)`,
      });
    }

    // Pacientes classificados como intermediário com fator agravante
    // Verifica se escore está entre 5-20% e tem agravante (sem chamar checkIntermediateRisk recursivamente)
    if (derived.risk_percentage_10y !== null && 
        derived.risk_percentage_10y >= 5 && derived.risk_percentage_10y < 20) {
      const modifiers = this.checkRiskModifiers();
      const hasAggravator = modifiers.some(m => 
        m.action === "upgrade_one_category" || 
        m.action === "upgrade_to_very_high" ||
        m.id === "cac_elevated" // CAC > 100 é agravante
      );
      if (hasAggravator) {
        criteria.push({
          id: "intermediate_with_aggravator",
          description: "Escore 5-20% com fator agravante",
        });
      }
    }

    // Aterosclerose subclínica: CAC > 100 UA ou percentil > 75, placa < 50%, AAA - Tabela 4.1
    if (imaging.has_cac === true && imaging.cac_score && imaging.cac_score > 100) {
      criteria.push({
        id: "subclinical_atherosclerosis_cac",
        description: `CAC > 100 UA (${imaging.cac_score} UA)`,
      });
    }
    if (imaging.has_carotid_us === true && imaging.carotid_plaque === true && 
        (!imaging.carotid_stenosis_percent || imaging.carotid_stenosis_percent < 50)) {
      criteria.push({
        id: "subclinical_atherosclerosis_plaque",
        description: "Placa aterosclerótica carotídea < 50%",
      });
    }
    if (imaging.has_abdominal_aneurysm === true) {
      criteria.push({
        id: "abdominal_aortic_aneurysm",
        description: "Aneurisma de aorta abdominal",
      });
    }

    // DM2 em homens ≥ 50 anos, mulheres ≥ 56 anos, com 1 ou 2 EAR, sem EMAR - Tabela 4.1
    if (clinical.has_diabetes === true) {
      const ageThreshold = patient.sex === "masculino" ? 50 : 56;
      if (patient.age >= ageThreshold) {
        const complications = clinical.diabetes_complications || [];
        const hasRealComplications = Array.isArray(complications) && 
          complications.some(c => c && c !== "none");
        const hasEMAR = hasRealComplications || 
          (clinical.has_ckd && ["4", "5"].includes(clinical.ckd_stage));
        
        if (!hasEMAR) {
          // EAR para DM2 - histórico familiar NÃO conta (apenas fator a considerar)
          let earCount = 0;
          if (clinical.has_hypertension) earCount++;
          if (clinical.is_current_smoker) earCount++;
          if (this.lipidData.hdl_c && ((patient.sex === "masculino" && this.lipidData.hdl_c < 40) || 
              (patient.sex === "feminino" && this.lipidData.hdl_c < 50))) earCount++;

          if (earCount >= 1 && earCount <= 2) {
            criteria.push({
              id: "dm2_age_with_1_2_ear",
              description: `DM2 (${patient.sex === "masculino" ? "≥ 50" : "≥ 56"} anos) com ${earCount} EAR, sem EMAR`,
            });
          }
        }
      }
    }

    return {
      isHighRisk: criteria.length > 0,
      criteria,
    };
  }

  // Verifica critérios de Risco Intermediário (Tabela 4.1)
  checkIntermediateRisk() {
    const criteria = [];
    const patient = this.patientData;
    const clinical = this.clinicalData;
    const lipids = this.lipidData;
    const derived = this.calculateDerivedValues();

    // 1. Escore calculado 5 a < 20% em 10 anos, na ausência de agravadores
    if (derived.risk_percentage_10y !== null) {
      if (derived.risk_percentage_10y >= 5 && derived.risk_percentage_10y < 20) {
        const modifiers = this.checkRiskModifiers();
        const hasAggravator = modifiers.some(m => 
          m.action === "upgrade_one_category" || 
          m.action === "upgrade_to_very_high"
        );
        if (!hasAggravator) {
          criteria.push({
            id: "score_5_to_20",
            description: `Escore de risco ${derived.risk_percentage_10y.toFixed(1)}% em 10 anos (5 a < 20%)`,
          });
        }
      }
      
      // 2. Baixo risco calculado (< 5% em 10 anos) com presença de agravador
      if (derived.risk_percentage_10y < 5) {
        const modifiers = this.checkRiskModifiers();
        const hasAggravator = modifiers.some(m => 
          m.action === "upgrade_one_category" || 
          m.action === "upgrade_to_very_high" ||
          m.id === "cac_elevated"
        );
        if (hasAggravator) {
          criteria.push({
            id: "low_score_with_aggravator",
            description: `Escore < 5% com fator agravante`,
          });
        }
      }
    }

    // 3. DM2 em homens < 50 anos, mulheres < 56 anos, sem EAR e sem EMAR
    if (clinical.has_diabetes === true) {
      const ageThreshold = patient.sex === "masculino" ? 50 : 56;
      if (patient.age < ageThreshold) {
        const complications = clinical.diabetes_complications || [];
        const hasRealComplications = Array.isArray(complications) && 
          complications.some(c => c && c !== "none");
        const hasEMAR = hasRealComplications || 
          (clinical.has_ckd && ["4", "5"].includes(clinical.ckd_stage));
        
        if (!hasEMAR) {
          // EAR para DM2 jovem - histórico familiar NÃO conta (apenas fator a considerar)
          let earCount = 0;
          if (clinical.has_hypertension) earCount++;
          if (clinical.is_current_smoker) earCount++;
          if (lipids.hdl_c && ((patient.sex === "masculino" && lipids.hdl_c < 40) || 
              (patient.sex === "feminino" && lipids.hdl_c < 50))) earCount++;

          if (earCount === 0) {
            criteria.push({
              id: "dm2_young_no_ear_no_emar",
              description: `DM2 (${patient.sex === "masculino" ? "< 50" : "< 56"} anos) sem EAR e sem EMAR`,
            });
          }
        }
      }
    }

    // 4. LDL-c > 160-189 mg/dL
    if (lipids.ldl_c && lipids.ldl_c > 160 && lipids.ldl_c <= 189) {
      criteria.push({
        id: "ldl_160_189",
        description: `LDL-c ${lipids.ldl_c} mg/dL (160-189 mg/dL)`,
      });
    }

    return {
      isIntermediateRisk: criteria.length > 0,
      criteria,
    };
  }

  // Verifica modificadores de risco
  // IMPORTANTE: Modificadores só elevam categoria se o paciente JÁ está em risco intermediário ou superior
  // Não devem elevar pacientes de baixo risco diretamente
  checkRiskModifiers() {
    const modifiers = [];
    const imaging = this.imagingData;
    const familyHistory = this.familyHistoryData;
    const lipids = this.lipidData;

    // CAC elevado - só se o valor foi informado e é > 100
    if (imaging.has_cac === true && imaging.cac_score && imaging.cac_score > 100) {
      modifiers.push({
        id: "cac_elevated",
        description: `CAC > 100 (${imaging.cac_score})`,
        action: "upgrade_one_category",
      });
    }

    // Placa carotídea - só se foi confirmada
    if (imaging.has_carotid_us === true && imaging.carotid_plaque === true) {
      modifiers.push({
        id: "carotid_plaque",
        description: "Placa aterosclerótica em carótidas",
        action: "upgrade_to_very_high",
      });
    }

    // História familiar de DAC precoce - é um modificador, mas NÃO eleva categoria automaticamente
    // Serve apenas como informação adicional quando já existe algum risco
    if (familyHistory.has_family_history_cad === true) {
      modifiers.push({
        id: "family_history_premature_cad",
        description: "História familiar de DAC precoce",
        action: "consider_upgrade", // mudado de upgrade_one_category para consider_upgrade
      });
    }

    // Hipertrigliceridemia grave
    if (lipids.triglycerides && lipids.triglycerides >= 500) {
      modifiers.push({
        id: "hypertriglyceridemia_severe",
        description: `TG muito elevado (${lipids.triglycerides} mg/dL)`,
        action: "metabolic_alert",
      });
    }

    return modifiers;
  }

  // Classificação final de risco
  classifyRisk() {
    // Verifica em ordem de prioridade (maior para menor risco)
    const extremeCheck = this.checkExtremeRisk();
    if (extremeCheck.isExtremeRisk) {
      return {
        category: "extreme",
        ...RISK_CATEGORIES.extreme,
        criteria: extremeCheck.criteria,
        modifiers: this.checkRiskModifiers(),
      };
    }

    const veryHighCheck = this.checkVeryHighRisk();
    if (veryHighCheck.isVeryHighRisk) {
      return {
        category: "very_high",
        ...RISK_CATEGORIES.very_high,
        criteria: veryHighCheck.criteria,
        modifiers: this.checkRiskModifiers(),
      };
    }

    const highCheck = this.checkHighRisk();
    if (highCheck.isHighRisk) {
      const modifiers = this.checkRiskModifiers();
      // Verifica se algum modificador eleva para muito alto (apenas placa carotídea)
      const upgradeToVeryHigh = modifiers.some(m => m.action === "upgrade_to_very_high");
      if (upgradeToVeryHigh) {
        return {
          category: "very_high",
          ...RISK_CATEGORIES.very_high,
          criteria: highCheck.criteria,
          modifiers,
          upgraded: true,
          originalCategory: "high",
        };
      }
      return {
        category: "high",
        ...RISK_CATEGORIES.high,
        criteria: highCheck.criteria,
        modifiers,
      };
    }

    const intermediateCheck = this.checkIntermediateRisk();
    if (intermediateCheck.isIntermediateRisk) {
      const modifiers = this.checkRiskModifiers();
      // APENAS CAC elevado ou placa carotídea elevam risco intermediário para alto
      // História familiar NÃO eleva automaticamente (apenas "consider_upgrade")
      const shouldUpgrade = modifiers.some(m => 
        m.action === "upgrade_one_category" || m.action === "upgrade_to_very_high"
      );
      if (shouldUpgrade) {
        const upgradeToVeryHigh = modifiers.some(m => m.action === "upgrade_to_very_high");
        return {
          category: upgradeToVeryHigh ? "very_high" : "high",
          ...(upgradeToVeryHigh ? RISK_CATEGORIES.very_high : RISK_CATEGORIES.high),
          criteria: intermediateCheck.criteria,
          modifiers,
          upgraded: true,
          originalCategory: "intermediate",
        };
      }
      return {
        category: "intermediate",
        ...RISK_CATEGORIES.intermediate,
        criteria: intermediateCheck.criteria,
        modifiers,
      };
    }

    // Baixo risco (Tabela 4.1): Escore < 5% em 10 anos + ausência de agravadores + ausência de DM2
    const derived = this.calculateDerivedValues();
    const modifiers = this.checkRiskModifiers();
    const clinical = this.clinicalData;
    
    const hasNoAggravators = !modifiers.some(m => 
      m.action === "upgrade_one_category" || 
      m.action === "upgrade_to_very_high"
    );
    const hasNoDiabetes = clinical.has_diabetes !== true;
    
    // Verifica se escore < 5% ou se não foi possível calcular (mas não há critérios de risco)
    const riskPercentage = derived.risk_percentage_10y;
    const isLowRiskScore = riskPercentage !== null && riskPercentage < 5;
    
    if ((isLowRiskScore || riskPercentage === null) && hasNoAggravators && hasNoDiabetes) {
      const criteria = [];
      if (isLowRiskScore) {
        criteria.push({
          id: "score_below_5",
          description: `Escore de risco < 5% em 10 anos (${riskPercentage.toFixed(1)}%)`,
        });
      } else {
        criteria.push({
          id: "no_risk_factors",
          description: "Sem fatores de risco cardiovascular significativos identificados"
        });
      }
      
      return {
        category: "low",
        ...RISK_CATEGORIES.low,
        criteria,
        modifiers: modifiers.filter(m => m.action !== "consider_upgrade"),
      };
    }
    
    // Se não se enquadra em baixo risco mas também não se enquadra em outras categorias,
    // retorna baixo risco como padrão
    return {
      category: "low",
      ...RISK_CATEGORIES.low,
      criteria: [{
        id: "default_low_risk",
        description: "Classificação padrão - sem critérios específicos identificados"
      }],
      modifiers: modifiers.filter(m => m.action !== "consider_upgrade"),
    };
  }

  // Avalia se valores lipídicos estão na meta
  evaluateLipidTargets(riskCategory) {
    const targets = RISK_CATEGORIES[riskCategory];
    const lipids = this.lipidData;
    const derived = this.calculateDerivedValues();

    const evaluation = {
      ldl_c: {
        current: lipids.ldl_c,
        target: targets.ldl_target,
        at_target: lipids.ldl_c <= targets.ldl_target,
        reduction_needed: lipids.ldl_c > targets.ldl_target 
          ? Math.round(((lipids.ldl_c - targets.ldl_target) / lipids.ldl_c) * 100)
          : 0,
      },
      non_hdl_c: {
        current: derived.non_hdl_c || lipids.non_hdl_c,
        target: targets.non_hdl_target,
        at_target: (derived.non_hdl_c || lipids.non_hdl_c) <= targets.non_hdl_target,
      },
      apo_b: {
        current: lipids.apo_b || derived.estimated_apo_b,
        target: targets.apo_b_target,
        at_target: (lipids.apo_b || derived.estimated_apo_b) <= targets.apo_b_target,
        estimated: !lipids.apo_b,
      },
    };

    return evaluation;
  }

  // Gera alertas
  generateAlerts() {
    const alerts = [];
    const lipids = this.lipidData;
    const clinical = this.clinicalData;
    const patient = this.patientData;

    // TG muito elevado
    if (lipids.triglycerides >= 500) {
      alerts.push({
        type: "critical",
        message: "Triglicerídeos ≥ 500 mg/dL - Risco de pancreatite aguda! Investigar causas secundárias.",
      });
    } else if (lipids.triglycerides >= 400) {
      alerts.push({
        type: "warning",
        message: "Triglicerídeos muito elevados - Verificar jejum e considerar causas secundárias.",
      });
    }

    // LDL muito elevado
    if (lipids.ldl_c >= 190) {
      alerts.push({
        type: "warning",
        message: "LDL-c ≥ 190 mg/dL - Considerar investigação de Hipercolesterolemia Familiar.",
      });
    }

    // Aviso: critério forte + suspeita de HF (não altera a categoria de risco)
    const familyHistory = this.familyHistoryData;
    const hasStrongCriterion = (lipids.ldl_c && lipids.ldl_c >= 190) ||
      this.atheroscleroticData.has_ascvd === true ||
      (familyHistory.family_ldl_very_high === true);
    if (hasStrongCriterion && familyHistory.suspected_familial_hypercholesterolemia === true) {
      alerts.push({
        type: "info",
        message: "ℹ️ Critério forte (LDL-c ≥ 190 mg/dL e/ou DASC e/ou LDL familiar muito elevado) associado à suspeita clínica de Hipercolesterolemia Familiar. Considerar investigação (critérios clínicos, escore Dutch Lipid Clinic, teste genético quando indicado). Este aviso não altera a categoria de risco.",
      });
    }

    // HDL baixo
    const hdlThreshold = patient.sex === "masculino" ? 40 : 50;
    if (lipids.hdl_c < hdlThreshold) {
      alerts.push({
        type: "info",
        message: `HDL-c baixo (< ${hdlThreshold} mg/dL) - Fator de risco adicional.`,
      });
    }

    // Diabético de longa duração
    if (clinical.has_diabetes && clinical.diabetes_duration_years >= 10) {
      alerts.push({
        type: "warning",
        message: "Diabetes ≥ 10 anos - Considerar avaliação de complicações microvasculares.",
      });
    }

    // Lp(a) não medida
    if (!lipids.has_lp_a) {
      alerts.push({
        type: "suggestion",
        message: "Lp(a) não foi medida - Recomenda-se dosagem ao menos uma vez na vida.",
      });
    }

    // Alerta para Quilomicronemia Familiar (TG > 885 mg/dL) - Escore de Moulin
    if (lipids.triglycerides > MOULIN_CHYLOMICRONEMIA_SCORE.selection_criteria.tg_threshold) {
      const moulinScore = this.calculateMoulinScore();
      if (moulinScore && moulinScore.applicable) {
        alerts.push({
          type: "critical",
          message: `⚠️ Triglicerídeos > 885 mg/dL - Escore de Moulin (SQF): ${moulinScore.score} pontos (${moulinScore.interpretationLabel}). ${moulinScore.recommendation}`,
          moulinScore: moulinScore,
        });
      } else if (moulinScore && !moulinScore.applicable) {
        alerts.push({
          type: "warning",
          message: `⚠️ Triglicerídeos > 885 mg/dL - ${moulinScore.reason}. ${moulinScore.recommendation}`,
        });
      } else {
        alerts.push({
          type: "critical",
          message: "⚠️ Triglicerídeos > 885 mg/dL - Critério de seleção para escore de Moulin (Quilomicronemia Familiar). Verificar se amostra está em jejum e fora da fase aguda.",
        });
      }
    }

    return alerts;
  }

  // Gera sugestão de dados faltantes
  generateMissingDataSuggestions() {
    const missing = [];
    const lipids = this.lipidData;
    const imaging = this.imagingData;

    if (!lipids.apo_b) {
      missing.push("ApoB - marcador alternativo para avaliar partículas aterogênicas");
    }

    if (!lipids.has_lp_a) {
      missing.push("Lipoproteína(a) - fator de risco independente");
    }

    if (!imaging.has_cac) {
      missing.push("Escore de cálcio coronário - útil para reclassificação de risco");
    }

    if (!imaging.has_carotid_us) {
      missing.push("Ultrassom de carótidas - identificação de aterosclerose subclínica");
    }

    if (!this.patientData.waist_circumference) {
      missing.push("Circunferência abdominal - avaliação de síndrome metabólica");
    }

    return missing;
  }

  // Gera avaliação completa
  generateFullAssessment(data) {
    this.loadData(data);
    
    const derived = this.calculateDerivedValues();
    const riskClassification = this.classifyRisk();
    const lipidTargets = this.evaluateLipidTargets(riskClassification.category);
    const alerts = this.generateAlerts();
    const missingData = this.generateMissingDataSuggestions();
    
    // Calcula escore de Moulin (SQF) se aplicável
    const moulinScore = this.calculateMoulinScore();

    return {
      derived_values: derived,
      risk_classification: riskClassification,
      lipid_targets: lipidTargets,
      alerts,
      missing_data: missingData,
      moulin_score: moulinScore,
      triglycerides: this.lipidData.triglycerides,
      guideline_version: "SBC_2025",
      assessment_date: new Date().toISOString(),
    };
  }
}

export default RiskEngine;
