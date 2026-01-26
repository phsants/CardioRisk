// ClinicalHistory Entity Schema
// Diretriz Brasileira de Dislipidemias SBC 2025

export const ClinicalHistorySchema = {
  name: "ClinicalHistory",
  type: "object",
  properties: {
    patient_id: {
      type: "string",
      description: "ID do paciente",
    },
    has_diabetes: {
      type: "boolean",
      description: "Possui diabetes",
    },
    diabetes_duration_years: {
      type: "number",
      description: "Tempo de diabetes em anos",
    },
    diabetes_complications: {
      type: "array",
      items: {
        type: "string",
        enum: ["retinopathy", "nephropathy", "neuropathy", "none"],
      },
      description: "Complicações microvasculares do diabetes",
    },
    has_hypertension: {
      type: "boolean",
      description: "Possui hipertensão arterial",
    },
    is_current_smoker: {
      type: "boolean",
      description: "Fumante atual",
    },
    is_former_smoker: {
      type: "boolean",
      description: "Ex-fumante",
    },
    years_since_quit_smoking: {
      type: "number",
      description: "Anos desde que parou de fumar",
    },
    has_metabolic_syndrome: {
      type: "boolean",
      description: "Possui síndrome metabólica",
    },
    has_chronic_kidney_disease: {
      type: "boolean",
      description: "Possui doença renal crônica",
    },
    ckd_stage: {
      type: "string",
      enum: ["1", "2", "3a", "3b", "4", "5"],
      description: "Estágio da DRC",
    },
    egfr: {
      type: "number",
      description: "Taxa de filtração glomerular estimada (mL/min/1.73m²)",
    },
    has_insulin_resistance: {
      type: "boolean",
      description: "Possui resistência insulínica documentada",
    },
    notes: {
      type: "string",
      description: "Observações clínicas",
    },
  },
  required: ["patient_id"],
};

// Helper class for ClinicalHistory entity
export class ClinicalHistory {
  constructor(data = {}) {
    this.patient_id = data.patient_id || null;
    this.has_diabetes = data.has_diabetes ?? null;
    this.diabetes_duration_years = data.diabetes_duration_years || null;
    this.diabetes_complications = data.diabetes_complications || [];
    this.has_hypertension = data.has_hypertension ?? null;
    this.is_current_smoker = data.is_current_smoker ?? null;
    this.is_former_smoker = data.is_former_smoker ?? null;
    this.years_since_quit_smoking = data.years_since_quit_smoking || null;
    this.has_metabolic_syndrome = data.has_metabolic_syndrome ?? null;
    this.has_chronic_kidney_disease = data.has_chronic_kidney_disease ?? null;
    this.ckd_stage = data.ckd_stage || null;
    this.egfr = data.egfr || null;
    this.has_insulin_resistance = data.has_insulin_resistance ?? null;
    this.notes = data.notes || null;
  }

  // Verifica se tem complicações reais de diabetes (excluindo "none")
  hasRealDiabetesComplications() {
    if (!Array.isArray(this.diabetes_complications)) return false;
    return this.diabetes_complications.some((c) => c && c !== "none");
  }

  // Verifica se diabetes tem longa duração (≥ 10 anos)
  hasLongDurationDiabetes() {
    return this.diabetes_duration_years !== null && this.diabetes_duration_years >= 10;
  }

  // Verifica se diabetes tem complicações OU longa duração
  hasDiabetesWithTOD() {
    return this.has_diabetes === true && (this.hasRealDiabetesComplications() || this.hasLongDurationDiabetes());
  }

  // Determina estágio da DRC baseado no eGFR se não estiver informado
  determineCkdStageFromEgfr() {
    if (this.egfr === null || this.egfr === undefined) return null;

    if (this.egfr >= 90) return "1";
    if (this.egfr >= 60) return "2";
    if (this.egfr >= 45) return "3a";
    if (this.egfr >= 30) return "3b";
    if (this.egfr >= 15) return "4";
    return "5";
  }

  // Verifica se DRC está em estágio 4 ou 5
  hasAdvancedCKD() {
    return this.ckd_stage === "4" || this.ckd_stage === "5";
  }

  // Verifica se DRC está em estágio 3
  hasStage3CKD() {
    return this.ckd_stage === "3a" || this.ckd_stage === "3b";
  }

  // Auto-completa estágio da DRC se eGFR estiver disponível
  autoCompleteCkdStage() {
    if (!this.ckd_stage && this.egfr !== null && this.egfr !== undefined) {
      this.ckd_stage = this.determineCkdStageFromEgfr();
    }
  }

  // Retorna status de tabagismo
  getSmokingStatus() {
    if (this.is_current_smoker === true) return "current";
    if (this.is_former_smoker === true) return "former";
    return "never";
  }

  // Conta fatores de risco tradicionais
  countTraditionalRiskFactors() {
    let count = 0;
    if (this.has_hypertension === true) count++;
    if (this.is_current_smoker === true) count++;
    if (this.has_metabolic_syndrome === true) count++;
    return count;
  }

  // Retorna lista de fatores de risco presentes
  getRiskFactors() {
    const factors = [];
    if (this.has_diabetes === true) {
      factors.push("Diabetes mellitus");
      if (this.hasRealDiabetesComplications()) {
        factors.push("Complicações microvasculares do diabetes");
      }
      if (this.hasLongDurationDiabetes()) {
        factors.push(`Diabetes ≥ 10 anos (${this.diabetes_duration_years} anos)`);
      }
    }
    if (this.has_hypertension === true) factors.push("Hipertensão arterial");
    if (this.is_current_smoker === true) factors.push("Tabagismo atual");
    if (this.is_former_smoker === true) factors.push("Ex-fumante");
    if (this.has_metabolic_syndrome === true) factors.push("Síndrome metabólica");
    if (this.has_chronic_kidney_disease === true) {
      factors.push(`DRC estágio ${this.ckd_stage || "desconhecido"}`);
    }
    if (this.has_insulin_resistance === true) factors.push("Resistência insulínica");
    return factors;
  }

  // Valida consistência dos dados
  validate() {
    const errors = [];
    const warnings = [];

    if (!this.patient_id) {
      errors.push("ID do paciente é obrigatório");
    }

    // Validações de diabetes
    if (this.has_diabetes === true) {
      if (this.diabetes_duration_years === null || this.diabetes_duration_years === undefined) {
        warnings.push("Duração do diabetes não informada");
      }
      if (!Array.isArray(this.diabetes_complications) || this.diabetes_complications.length === 0) {
        warnings.push("Complicações do diabetes não informadas");
      }
    }

    // Validações de complicações do diabetes
    if (Array.isArray(this.diabetes_complications)) {
      const validComplications = ["retinopathy", "nephropathy", "neuropathy", "none"];
      const invalidComplications = this.diabetes_complications.filter(
        (c) => !validComplications.includes(c)
      );
      if (invalidComplications.length > 0) {
        errors.push(`Complicações inválidas: ${invalidComplications.join(", ")}`);
      }
    }

    // Validações de tabagismo
    if (this.is_current_smoker === true && this.is_former_smoker === true) {
      warnings.push("Paciente não pode ser fumante atual e ex-fumante simultaneamente");
    }
    if (this.is_former_smoker === true && !this.years_since_quit_smoking) {
      warnings.push("Anos desde que parou de fumar não informado para ex-fumante");
    }

    // Validações de DRC
    if (this.has_chronic_kidney_disease === true) {
      if (!this.ckd_stage) {
        if (this.egfr) {
          warnings.push("Estágio da DRC não informado, mas eGFR está disponível");
        } else {
          warnings.push("Estágio da DRC e eGFR não informados");
        }
      }
      const validStages = ["1", "2", "3a", "3b", "4", "5"];
      if (this.ckd_stage && !validStages.includes(this.ckd_stage)) {
        errors.push(`Estágio da DRC inválido: ${this.ckd_stage}`);
      }
    } else if (this.ckd_stage) {
      warnings.push("Estágio da DRC informado mas 'has_chronic_kidney_disease' é false");
    }

    // Validações de eGFR
    if (this.egfr !== null && this.egfr !== undefined) {
      if (this.egfr < 0 || this.egfr > 200) {
        warnings.push(`eGFR fora da faixa esperada: ${this.egfr} mL/min/1.73m²`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      patient_id: this.patient_id,
      has_diabetes: this.has_diabetes,
      diabetes_duration_years: this.diabetes_duration_years,
      diabetes_complications: this.diabetes_complications,
      has_hypertension: this.has_hypertension,
      is_current_smoker: this.is_current_smoker,
      is_former_smoker: this.is_former_smoker,
      years_since_quit_smoking: this.years_since_quit_smoking,
      has_metabolic_syndrome: this.has_metabolic_syndrome,
      has_chronic_kidney_disease: this.has_chronic_kidney_disease,
      ckd_stage: this.ckd_stage,
      egfr: this.egfr,
      has_insulin_resistance: this.has_insulin_resistance,
      notes: this.notes,
    };
  }
}

export default ClinicalHistory;
