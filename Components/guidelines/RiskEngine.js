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

    return derived;
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

    // HF + DASC
    if (this.familyHistoryData.suspected_familial_hypercholesterolemia && atherosclerotic.has_ascvd) {
      criteria.push({
        id: "familial_hypercholesterolemia_plus_ascvd",
        description: "Hipercolesterolemia familiar + doença aterosclerótica",
      });
    }

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

    // Aterosclerose subclínica significativa - só se os exames foram feitos e confirmados
    if (imaging.has_cac === true && imaging.cac_score && imaging.cac_score > 100) {
      criteria.push({
        id: "subclinical_atherosclerosis_cac",
        description: `CAC elevado (${imaging.cac_score})`,
      });
    }
    if (imaging.has_carotid_us === true && imaging.carotid_plaque === true) {
      criteria.push({
        id: "subclinical_atherosclerosis_plaque",
        description: "Placa aterosclerótica em carótidas",
      });
    }

    // Hipercolesterolemia familiar sem DASC - só se confirmado
    if (familyHistory.suspected_familial_hypercholesterolemia === true && atherosclerotic.has_ascvd !== true) {
      criteria.push({
        id: "familial_hypercholesterolemia",
        description: "Hipercolesterolemia familiar",
      });
    }

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

    // Lp(a) elevada - só se foi medida e está elevada
    if (lipids.has_lp_a === true && lipids.lp_a_value) {
      const isElevated = lipids.lp_a_unit === "nmol_l" 
        ? lipids.lp_a_value > 125 
        : lipids.lp_a_value > 50;
      if (isElevated) {
        criteria.push({
          id: "lp_a_elevated",
          description: `Lp(a) elevada (${lipids.lp_a_value} ${lipids.lp_a_unit === "nmol_l" ? "nmol/L" : "mg/dL"})`,
        });
      }
    }

    return {
      isHighRisk: criteria.length > 0,
      criteria,
    };
  }

  // Verifica critérios de Risco Intermediário
  checkIntermediateRisk() {
    const criteria = [];
    const patient = this.patientData;
    const clinical = this.clinicalData;
    const derived = this.calculateDerivedValues();

    // Contagem de fatores de risco tradicionais
    // Só conta se o valor realmente indica risco
    let riskFactorCount = 0;
    const riskFactorsPresent = [];
    
    if (clinical.has_hypertension === true) {
      riskFactorCount++;
      riskFactorsPresent.push("HAS");
    }
    if (clinical.is_current_smoker === true) {
      riskFactorCount++;
      riskFactorsPresent.push("Tabagismo");
    }
    if (this.familyHistoryData.has_family_history_cad === true) {
      riskFactorCount++;
      riskFactorsPresent.push("HF DAC precoce");
    }
    // HDL baixo só conta se o valor foi informado E está abaixo do limite
    if (this.lipidData.hdl_c && patient.sex === "masculino" && this.lipidData.hdl_c < 40) {
      riskFactorCount++;
      riskFactorsPresent.push("HDL baixo");
    }
    if (this.lipidData.hdl_c && patient.sex === "feminino" && this.lipidData.hdl_c < 50) {
      riskFactorCount++;
      riskFactorsPresent.push("HDL baixo");
    }

    // Precisa de pelo menos 2 fatores de risco confirmados para ser intermediário
    if (riskFactorCount >= 2) {
      criteria.push({
        id: "multiple_risk_factors",
        description: `${riskFactorCount} fatores de risco tradicionais (${riskFactorsPresent.join(", ")})`,
      });
    }

    // Síndrome metabólica - só considera se realmente presente
    if (derived.metabolic_syndrome?.present === true && derived.metabolic_syndrome?.criteriaCount >= 3) {
      criteria.push({
        id: "metabolic_syndrome",
        description: `Síndrome metabólica (${derived.metabolic_syndrome.criteriaCount} critérios)`,
      });
    }

    // Mulher pós-menopausa com fatores de risco (precisa ter pelo menos 1 fator de risco real)
    if (patient.sex === "feminino" && patient.menopause_status === "post_menopause") {
      if (riskFactorCount >= 1) {
        criteria.push({
          id: "postmenopausal_with_risk",
          description: "Mulher pós-menopausa com fatores de risco",
        });
      }
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

    // Baixo risco (default) - paciente sem critérios de risco
    // Modificadores são informativos, mas NÃO elevam paciente de baixo risco
    const modifiers = this.checkRiskModifiers();
    
    return {
      category: "low",
      ...RISK_CATEGORIES.low,
      criteria: [{
        id: "no_risk_factors",
        description: "Sem fatores de risco cardiovascular significativos identificados"
      }],
      modifiers: modifiers.filter(m => m.action !== "consider_upgrade"), // Remove modificadores que só são relevantes em risco maior
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

    return {
      derived_values: derived,
      risk_classification: riskClassification,
      lipid_targets: lipidTargets,
      alerts,
      missing_data: missingData,
      guideline_version: "SBC_2025",
      assessment_date: new Date().toISOString(),
    };
  }
}

export default RiskEngine;
