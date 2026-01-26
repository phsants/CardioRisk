// RiskAssessment Entity Schema
// Diretriz Brasileira de Dislipidemias SBC 2025

export const RiskAssessmentSchema = {
  name: "RiskAssessment",
  type: "object",
  properties: {
    patient_id: {
      type: "string",
      description: "ID do paciente",
    },
    assessment_date: {
      type: "string",
      format: "date",
      description: "Data da avaliação",
    },
    risk_category: {
      type: "string",
      enum: ["low", "intermediate", "high", "very_high", "extreme"],
      description: "Categoria de risco cardiovascular",
    },
    risk_category_justification: {
      type: "string",
      description: "Justificativa da classificação",
    },
    ldl_target: {
      type: "number",
      description: "Meta de LDL-c (mg/dL)",
    },
    non_hdl_target: {
      type: "number",
      description: "Meta de Não-HDL-c (mg/dL)",
    },
    apo_b_target: {
      type: "number",
      description: "Meta de ApoB (mg/dL)",
    },
    ldl_current: {
      type: "number",
      description: "LDL-c atual (mg/dL)",
    },
    ldl_at_target: {
      type: "boolean",
      description: "LDL-c está na meta",
    },
    ldl_reduction_needed: {
      type: "number",
      description: "Redução necessária de LDL-c (%)",
    },
    non_hdl_current: {
      type: "number",
      description: "Não-HDL-c atual (mg/dL)",
    },
    non_hdl_at_target: {
      type: "boolean",
      description: "Não-HDL-c está na meta",
    },
    risk_modifiers: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Fatores modificadores de risco identificados",
    },
    alerts: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Alertas gerados",
    },
    missing_data: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Dados faltantes sugeridos",
    },
    recommendations: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Recomendações baseadas na diretriz",
    },
    guideline_version: {
      type: "string",
      default: "SBC_2025",
      description: "Versão da diretriz utilizada",
    },
    physician_notes: {
      type: "string",
      description: "Notas do médico",
    },
  },
  required: ["patient_id", "assessment_date", "risk_category"],
};

// Helper class for RiskAssessment entity
export class RiskAssessment {
  constructor(data = {}) {
    this.patient_id = data.patient_id || null;
    this.assessment_date = data.assessment_date || null;
    this.risk_category = data.risk_category || null;
    this.risk_category_justification = data.risk_category_justification || null;
    this.ldl_target = data.ldl_target || null;
    this.non_hdl_target = data.non_hdl_target || null;
    this.apo_b_target = data.apo_b_target || null;
    this.ldl_current = data.ldl_current || null;
    this.ldl_at_target = data.ldl_at_target ?? null;
    this.ldl_reduction_needed = data.ldl_reduction_needed || null;
    this.non_hdl_current = data.non_hdl_current || null;
    this.non_hdl_at_target = data.non_hdl_at_target ?? null;
    this.risk_modifiers = data.risk_modifiers || [];
    this.alerts = data.alerts || [];
    this.missing_data = data.missing_data || [];
    this.recommendations = data.recommendations || [];
    this.guideline_version = data.guideline_version || "SBC_2025";
    this.physician_notes = data.physician_notes || null;
  }

  // Calcula redução necessária de LDL-c em percentual
  calculateLdlReductionNeeded() {
    if (this.ldl_current === null || this.ldl_target === null) return null;
    if (this.ldl_current <= this.ldl_target) return 0;
    return Math.round(((this.ldl_current - this.ldl_target) / this.ldl_current) * 100);
  }

  // Verifica se LDL-c está na meta
  checkLdlAtTarget() {
    if (this.ldl_current === null || this.ldl_target === null) return null;
    return this.ldl_current <= this.ldl_target;
  }

  // Verifica se Não-HDL-c está na meta
  checkNonHdlAtTarget() {
    if (this.non_hdl_current === null || this.non_hdl_target === null) return null;
    return this.non_hdl_current <= this.non_hdl_target;
  }

  // Auto-completa valores calculados
  autoComplete() {
    // Calcula redução necessária se não estiver disponível
    if (this.ldl_reduction_needed === null) {
      this.ldl_reduction_needed = this.calculateLdlReductionNeeded();
    }

    // Verifica se está na meta se não estiver disponível
    if (this.ldl_at_target === null) {
      this.ldl_at_target = this.checkLdlAtTarget();
    }

    if (this.non_hdl_at_target === null) {
      this.non_hdl_at_target = this.checkNonHdlAtTarget();
    }
  }

  // Retorna nome da categoria de risco
  getRiskCategoryName() {
    const names = {
      low: "Baixo Risco",
      intermediate: "Risco Intermediário",
      high: "Alto Risco",
      very_high: "Muito Alto Risco",
      extreme: "Risco Extremo",
    };
    return names[this.risk_category] || this.risk_category;
  }

  // Retorna cor da categoria de risco
  getRiskCategoryColor() {
    const colors = {
      low: "#22C55E",
      intermediate: "#F59E0B",
      high: "#F97316",
      very_high: "#EF4444",
      extreme: "#7F1D1D",
    };
    return colors[this.risk_category] || "#6B7280";
  }

  // Verifica se está em alto risco ou superior
  isHighRiskOrAbove() {
    return ["high", "very_high", "extreme"].includes(this.risk_category);
  }

  // Verifica se está em muito alto risco ou superior
  isVeryHighRiskOrAbove() {
    return ["very_high", "extreme"].includes(this.risk_category);
  }

  // Retorna status geral da avaliação
  getStatus() {
    const status = {
      riskCategory: this.getRiskCategoryName(),
      ldlStatus: this.ldl_at_target ? "Na meta" : "Fora da meta",
      nonHdlStatus: this.non_hdl_at_target ? "Na meta" : "Fora da meta",
      hasAlerts: Array.isArray(this.alerts) && this.alerts.length > 0,
      hasMissingData: Array.isArray(this.missing_data) && this.missing_data.length > 0,
      hasRecommendations: Array.isArray(this.recommendations) && this.recommendations.length > 0,
      hasRiskModifiers: Array.isArray(this.risk_modifiers) && this.risk_modifiers.length > 0,
    };
    return status;
  }

  // Retorna resumo da avaliação
  getSummary() {
    return {
      date: this.assessment_date,
      category: this.risk_category,
      categoryName: this.getRiskCategoryName(),
      ldlCurrent: this.ldl_current,
      ldlTarget: this.ldl_target,
      ldlAtTarget: this.ldl_at_target,
      ldlReductionNeeded: this.ldl_reduction_needed,
      nonHdlCurrent: this.non_hdl_current,
      nonHdlTarget: this.non_hdl_target,
      nonHdlAtTarget: this.non_hdl_at_target,
      alertsCount: Array.isArray(this.alerts) ? this.alerts.length : 0,
      missingDataCount: Array.isArray(this.missing_data) ? this.missing_data.length : 0,
      recommendationsCount: Array.isArray(this.recommendations) ? this.recommendations.length : 0,
      guidelineVersion: this.guideline_version,
    };
  }

  // Calcula dias desde a avaliação
  getDaysSinceAssessment() {
    if (!this.assessment_date) return null;
    const today = new Date();
    const assessment = new Date(this.assessment_date);
    const diffTime = Math.abs(today - assessment);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Verifica se a avaliação é recente (< 1 ano)
  isRecent() {
    const days = this.getDaysSinceAssessment();
    return days !== null && days < 365;
  }

  // Valida consistência dos dados
  validate() {
    const errors = [];
    const warnings = [];

    if (!this.patient_id) {
      errors.push("ID do paciente é obrigatório");
    }

    if (!this.assessment_date) {
      errors.push("Data da avaliação é obrigatória");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(this.assessment_date)) {
      errors.push("Data da avaliação deve estar no formato YYYY-MM-DD");
    }

    if (!this.risk_category) {
      errors.push("Categoria de risco é obrigatória");
    } else {
      const validCategories = ["low", "intermediate", "high", "very_high", "extreme"];
      if (!validCategories.includes(this.risk_category)) {
        errors.push(`Categoria de risco inválida: ${this.risk_category}`);
      }
    }

    // Validações de metas
    if (this.ldl_target !== null && (this.ldl_target < 0 || this.ldl_target > 300)) {
      warnings.push(`Meta de LDL-c fora da faixa esperada: ${this.ldl_target} mg/dL`);
    }

    if (this.non_hdl_target !== null && (this.non_hdl_target < 0 || this.non_hdl_target > 400)) {
      warnings.push(`Meta de Não-HDL-c fora da faixa esperada: ${this.non_hdl_target} mg/dL`);
    }

    if (this.apo_b_target !== null && (this.apo_b_target < 0 || this.apo_b_target > 200)) {
      warnings.push(`Meta de ApoB fora da faixa esperada: ${this.apo_b_target} mg/dL`);
    }

    // Validações de valores atuais
    if (this.ldl_current !== null && (this.ldl_current < 0 || this.ldl_current > 1000)) {
      warnings.push(`LDL-c atual fora da faixa esperada: ${this.ldl_current} mg/dL`);
    }

    if (this.non_hdl_current !== null && (this.non_hdl_current < 0 || this.non_hdl_current > 1200)) {
      warnings.push(`Não-HDL-c atual fora da faixa esperada: ${this.non_hdl_current} mg/dL`);
    }

    // Validações de redução necessária
    if (this.ldl_reduction_needed !== null) {
      if (this.ldl_reduction_needed < 0 || this.ldl_reduction_needed > 100) {
        warnings.push(`Redução necessária de LDL-c fora da faixa esperada: ${this.ldl_reduction_needed}%`);
      }
    }

    // Validações de consistência
    if (this.ldl_at_target === true && this.ldl_reduction_needed !== null && this.ldl_reduction_needed > 0) {
      warnings.push("LDL-c está na meta mas redução necessária > 0%");
    }

    if (this.ldl_at_target === false && this.ldl_reduction_needed !== null && this.ldl_reduction_needed === 0) {
      warnings.push("LDL-c está fora da meta mas redução necessária = 0%");
    }

    // Validações de arrays
    if (!Array.isArray(this.risk_modifiers)) {
      errors.push("risk_modifiers deve ser um array");
    }
    if (!Array.isArray(this.alerts)) {
      errors.push("alerts deve ser um array");
    }
    if (!Array.isArray(this.missing_data)) {
      errors.push("missing_data deve ser um array");
    }
    if (!Array.isArray(this.recommendations)) {
      errors.push("recommendations deve ser um array");
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
      assessment_date: this.assessment_date,
      risk_category: this.risk_category,
      risk_category_justification: this.risk_category_justification,
      ldl_target: this.ldl_target,
      non_hdl_target: this.non_hdl_target,
      apo_b_target: this.apo_b_target,
      ldl_current: this.ldl_current,
      ldl_at_target: this.ldl_at_target,
      ldl_reduction_needed: this.ldl_reduction_needed,
      non_hdl_current: this.non_hdl_current,
      non_hdl_at_target: this.non_hdl_at_target,
      risk_modifiers: this.risk_modifiers,
      alerts: this.alerts,
      missing_data: this.missing_data,
      recommendations: this.recommendations,
      guideline_version: this.guideline_version,
      physician_notes: this.physician_notes,
    };
  }
}

export default RiskAssessment;
