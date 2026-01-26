// LipidPanel Entity Schema
// Diretriz Brasileira de Dislipidemias SBC 2025

export const LipidPanelSchema = {
  name: "LipidPanel",
  type: "object",
  properties: {
    patient_id: {
      type: "string",
      description: "ID do paciente",
    },
    exam_date: {
      type: "string",
      format: "date",
      description: "Data do exame",
    },
    fasting: {
      type: "boolean",
      description: "Exame feito em jejum",
    },
    total_cholesterol: {
      type: "number",
      description: "Colesterol Total (mg/dL)",
    },
    ldl_c: {
      type: "number",
      description: "LDL-c (mg/dL)",
    },
    hdl_c: {
      type: "number",
      description: "HDL-c (mg/dL)",
    },
    triglycerides: {
      type: "number",
      description: "Triglicerídeos (mg/dL)",
    },
    non_hdl_c: {
      type: "number",
      description: "Não-HDL-c (mg/dL) - calculado ou informado",
    },
    apo_b: {
      type: "number",
      description: "ApoB (mg/dL) - se disponível",
    },
    lp_a: {
      type: "number",
      description: "Lipoproteína(a) (nmol/L ou mg/dL)",
    },
    lp_a_unit: {
      type: "string",
      enum: ["nmol_l", "mg_dl"],
      description: "Unidade da Lp(a)",
    },
    notes: {
      type: "string",
      description: "Observações sobre o exame",
    },
  },
  required: ["patient_id", "exam_date"],
};

// Helper class for LipidPanel entity
export class LipidPanel {
  constructor(data = {}) {
    this.patient_id = data.patient_id || null;
    this.exam_date = data.exam_date || null;
    this.fasting = data.fasting ?? null;
    this.total_cholesterol = data.total_cholesterol || null;
    this.ldl_c = data.ldl_c || null;
    this.hdl_c = data.hdl_c || null;
    this.triglycerides = data.triglycerides || null;
    this.non_hdl_c = data.non_hdl_c || null;
    this.apo_b = data.apo_b || null;
    this.lp_a = data.lp_a || null;
    this.lp_a_unit = data.lp_a_unit || null;
    this.notes = data.notes || null;
  }

  // Calcula Não-HDL-c a partir de Colesterol Total - HDL-c
  calculateNonHdlC() {
    if (this.total_cholesterol !== null && this.hdl_c !== null) {
      return this.total_cholesterol - this.hdl_c;
    }
    return null;
  }

  // Calcula LDL-c usando fórmula de Friedewald (se não estiver disponível)
  calculateFriedewaldLdl() {
    if (this.total_cholesterol !== null && this.hdl_c !== null && this.triglycerides !== null) {
      // Fórmula de Friedewald não é válida se TG > 400 mg/dL
      if (this.triglycerides > 400) {
        return null;
      }
      return this.total_cholesterol - this.hdl_c - (this.triglycerides / 5);
    }
    return null;
  }

  // Estima ApoB a partir de Não-HDL-c (fórmula aproximada: ApoB ≈ 0.8 × Não-HDL-c)
  estimateApoB() {
    const nonHdlC = this.non_hdl_c || this.calculateNonHdlC();
    if (nonHdlC !== null) {
      return nonHdlC * 0.8;
    }
    return null;
  }

  // Converte Lp(a) entre unidades (1 mg/dL ≈ 2.5 nmol/L)
  convertLpA(targetUnit) {
    if (!this.lp_a || !this.lp_a_unit) return null;
    
    if (this.lp_a_unit === targetUnit) {
      return this.lp_a;
    }
    
    if (this.lp_a_unit === "mg_dl" && targetUnit === "nmol_l") {
      return this.lp_a * 2.5;
    }
    
    if (this.lp_a_unit === "nmol_l" && targetUnit === "mg_dl") {
      return this.lp_a / 2.5;
    }
    
    return null;
  }

  // Verifica se os valores estão dentro dos limites de referência
  checkReferenceValues(sex = "masculino") {
    const warnings = [];
    
    // Colesterol Total
    if (this.total_cholesterol >= 240) {
      warnings.push({ type: "high", parameter: "Colesterol Total", value: this.total_cholesterol, limit: "≥ 240 mg/dL (Elevado)" });
    } else if (this.total_cholesterol >= 190 && this.total_cholesterol < 240) {
      warnings.push({ type: "borderline", parameter: "Colesterol Total", value: this.total_cholesterol, limit: "190-239 mg/dL (Limítrofe)" });
    }
    
    // LDL-c
    if (this.ldl_c >= 190) {
      warnings.push({ type: "high", parameter: "LDL-c", value: this.ldl_c, limit: "≥ 190 mg/dL (Muito Alto)" });
    } else if (this.ldl_c >= 160 && this.ldl_c < 190) {
      warnings.push({ type: "high", parameter: "LDL-c", value: this.ldl_c, limit: "160-189 mg/dL (Alto)" });
    } else if (this.ldl_c >= 130 && this.ldl_c < 160) {
      warnings.push({ type: "borderline", parameter: "LDL-c", value: this.ldl_c, limit: "130-159 mg/dL (Limítrofe)" });
    }
    
    // HDL-c
    const hdlThreshold = sex === "masculino" ? 40 : 50;
    if (this.hdl_c < hdlThreshold) {
      warnings.push({ type: "low", parameter: "HDL-c", value: this.hdl_c, limit: `< ${hdlThreshold} mg/dL (Baixo para ${sex})` });
    }
    
    // Triglicerídeos
    if (this.triglycerides >= 500) {
      warnings.push({ type: "critical", parameter: "Triglicerídeos", value: this.triglycerides, limit: "≥ 500 mg/dL (Risco de pancreatite!)" });
    } else if (this.triglycerides >= 400) {
      warnings.push({ type: "high", parameter: "Triglicerídeos", value: this.triglycerides, limit: "≥ 400 mg/dL (Muito elevado)" });
    } else if (this.triglycerides >= 200 && this.triglycerides < 400) {
      warnings.push({ type: "high", parameter: "Triglicerídeos", value: this.triglycerides, limit: "200-499 mg/dL (Alto)" });
    } else if (this.triglycerides >= 150 && this.triglycerides < 200) {
      warnings.push({ type: "borderline", parameter: "Triglicerídeos", value: this.triglycerides, limit: "150-199 mg/dL (Limítrofe)" });
    }
    
    // Lp(a)
    if (this.lp_a && this.lp_a_unit) {
      if (this.lp_a_unit === "nmol_l" && this.lp_a >= 125) {
        warnings.push({ type: "high", parameter: "Lp(a)", value: this.lp_a, limit: "≥ 125 nmol/L (Alto)" });
      } else if (this.lp_a_unit === "mg_dl" && this.lp_a >= 50) {
        warnings.push({ type: "high", parameter: "Lp(a)", value: this.lp_a, limit: "≥ 50 mg/dL (Alto)" });
      }
    }
    
    return warnings;
  }

  // Auto-completa valores calculados se estiverem faltando
  autoComplete() {
    // Calcula Não-HDL-c se não estiver disponível
    if (this.non_hdl_c === null) {
      this.non_hdl_c = this.calculateNonHdlC();
    }
    
    // Calcula LDL-c por Friedewald se não estiver disponível e TG < 400
    if (this.ldl_c === null && this.triglycerides !== null && this.triglycerides <= 400) {
      this.ldl_c = this.calculateFriedewaldLdl();
    }
    
    // Estima ApoB se não estiver disponível
    if (this.apo_b === null) {
      this.apo_b = this.estimateApoB();
    }
  }

  // Valida se os dados obrigatórios estão presentes
  validate() {
    const errors = [];
    if (!this.patient_id) errors.push("ID do paciente é obrigatório");
    if (!this.exam_date) errors.push("Data do exame é obrigatória");
    
    // Valida formato de data
    if (this.exam_date && !/^\d{4}-\d{2}-\d{2}$/.test(this.exam_date)) {
      errors.push("Data do exame deve estar no formato YYYY-MM-DD");
    }
    
    // Valida unidade de Lp(a)
    if (this.lp_a_unit && !["nmol_l", "mg_dl"].includes(this.lp_a_unit)) {
      errors.push("Unidade de Lp(a) deve ser 'nmol_l' ou 'mg_dl'");
    }
    
    // Valida que se Lp(a) está presente, a unidade também deve estar
    if (this.lp_a !== null && !this.lp_a_unit) {
      errors.push("Unidade de Lp(a) é obrigatória quando Lp(a) é informado");
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      patient_id: this.patient_id,
      exam_date: this.exam_date,
      fasting: this.fasting,
      total_cholesterol: this.total_cholesterol,
      ldl_c: this.ldl_c,
      hdl_c: this.hdl_c,
      triglycerides: this.triglycerides,
      non_hdl_c: this.non_hdl_c,
      apo_b: this.apo_b,
      lp_a: this.lp_a,
      lp_a_unit: this.lp_a_unit,
      notes: this.notes,
    };
  }
}

export default LipidPanel;
