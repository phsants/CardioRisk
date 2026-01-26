// AtheroscleroticDisease Entity Schema
// Diretriz Brasileira de Dislipidemias SBC 2025

export const AtheroscleroticDiseaseSchema = {
  name: "AtheroscleroticDisease",
  type: "object",
  properties: {
    patient_id: {
      type: "string",
      description: "ID do paciente",
    },
    has_ascvd: {
      type: "boolean",
      description: "Possui doença aterosclerótica clínica",
    },
    myocardial_infarction: {
      type: "boolean",
      description: "Infarto agudo do miocárdio prévio",
    },
    mi_date: {
      type: "string",
      format: "date",
      description: "Data do IAM",
    },
    ischemic_stroke: {
      type: "boolean",
      description: "AVC isquêmico prévio",
    },
    stroke_date: {
      type: "string",
      format: "date",
      description: "Data do AVC",
    },
    unstable_angina: {
      type: "boolean",
      description: "Angina instável prévia",
    },
    revascularization: {
      type: "boolean",
      description: "Revascularização prévia (stent ou cirurgia)",
    },
    revascularization_type: {
      type: "string",
      enum: ["pci", "cabg", "both"],
      description: "Tipo de revascularização",
    },
    peripheral_artery_disease: {
      type: "boolean",
      description: "Doença arterial periférica",
    },
    carotid_stenosis: {
      type: "boolean",
      description: "Estenose de carótida significativa",
    },
    carotid_stenosis_percentage: {
      type: "number",
      description: "Percentual de estenose carotídea",
    },
    aortic_aneurysm: {
      type: "boolean",
      description: "Aneurisma de aorta",
    },
    carotid_plaque: {
      type: "boolean",
      description: "Placa em carótida (ultrassom)",
    },
    coronary_calcium_score: {
      type: "number",
      description: "Escore de cálcio coronário",
    },
    lvh: {
      type: "boolean",
      description: "Hipertrofia ventricular esquerda",
    },
    recurrent_events: {
      type: "boolean",
      description: "Eventos cardiovasculares recorrentes",
    },
    multivessel_disease: {
      type: "boolean",
      description: "Doença multiarterial",
    },
    notes: {
      type: "string",
      description: "Observações sobre doença aterosclerótica",
    },
  },
  required: ["patient_id"],
};

// Helper class for AtheroscleroticDisease entity
export class AtheroscleroticDisease {
  constructor(data = {}) {
    this.patient_id = data.patient_id || null;
    this.has_ascvd = data.has_ascvd ?? null;
    this.myocardial_infarction = data.myocardial_infarction ?? null;
    this.mi_date = data.mi_date || null;
    this.ischemic_stroke = data.ischemic_stroke ?? null;
    this.stroke_date = data.stroke_date || null;
    this.unstable_angina = data.unstable_angina ?? null;
    this.revascularization = data.revascularization ?? null;
    this.revascularization_type = data.revascularization_type || null;
    this.peripheral_artery_disease = data.peripheral_artery_disease ?? null;
    this.carotid_stenosis = data.carotid_stenosis ?? null;
    this.carotid_stenosis_percentage = data.carotid_stenosis_percentage || null;
    this.aortic_aneurysm = data.aortic_aneurysm ?? null;
    this.carotid_plaque = data.carotid_plaque ?? null;
    this.coronary_calcium_score = data.coronary_calcium_score || null;
    this.lvh = data.lvh ?? null;
    this.recurrent_events = data.recurrent_events ?? null;
    this.multivessel_disease = data.multivessel_disease ?? null;
    this.notes = data.notes || null;
  }

  // Retorna lista de eventos CV presentes
  getAscvdEvents() {
    const events = [];
    if (this.myocardial_infarction === true) events.push("IAM");
    if (this.ischemic_stroke === true) events.push("AVC Isquêmico");
    if (this.unstable_angina === true) events.push("Angina Instável");
    if (this.revascularization === true) {
      const revType = this.revascularization_type === "pci" ? "PCI" :
                     this.revascularization_type === "cabg" ? "CABG" :
                     this.revascularization_type === "both" ? "PCI + CABG" : "Revascularização";
      events.push(revType);
    }
    if (this.peripheral_artery_disease === true) events.push("DAP");
    if (this.carotid_stenosis === true) {
      const stenosis = this.carotid_stenosis_percentage 
        ? `Estenose Carotídea (${this.carotid_stenosis_percentage}%)`
        : "Estenose Carotídea";
      events.push(stenosis);
    }
    if (this.aortic_aneurysm === true) events.push("Aneurisma de Aorta");
    return events;
  }

  // Verifica se tem doença aterosclerótica clínica estabelecida
  hasClinicalAscvd() {
    return this.has_ascvd === true || 
           this.myocardial_infarction === true ||
           this.ischemic_stroke === true ||
           this.unstable_angina === true ||
           this.revascularization === true ||
           this.peripheral_artery_disease === true ||
           this.carotid_stenosis === true ||
           this.aortic_aneurysm === true;
  }

  // Verifica se tem aterosclerose subclínica significativa
  hasSubclinicalAtherosclerosis() {
    // CAC > 100 ou placa carotídea indica aterosclerose subclínica significativa
    return (this.coronary_calcium_score !== null && this.coronary_calcium_score > 100) ||
           this.carotid_plaque === true;
  }

  // Verifica se tem doença polivascular (múltiplos territórios)
  hasPolyvascularDisease() {
    const territories = [];
    if (this.myocardial_infarction === true || this.revascularization === true) {
      territories.push("coronariano");
    }
    if (this.ischemic_stroke === true || this.carotid_stenosis === true) {
      territories.push("cerebrovascular");
    }
    if (this.peripheral_artery_disease === true || this.aortic_aneurysm === true) {
      territories.push("periférico");
    }
    return territories.length >= 2;
  }

  // Retorna territórios vasculares afetados
  getAffectedVascularTerritories() {
    const territories = [];
    if (this.myocardial_infarction === true || this.revascularization === true || this.coronary_calcium_score !== null) {
      territories.push("Coronariano");
    }
    if (this.ischemic_stroke === true || this.carotid_stenosis === true || this.carotid_plaque === true) {
      territories.push("Cerebrovascular");
    }
    if (this.peripheral_artery_disease === true || this.aortic_aneurysm === true) {
      territories.push("Periférico");
    }
    return territories;
  }

  // Verifica se CAC está elevado (> 100)
  hasElevatedCAC() {
    return this.coronary_calcium_score !== null && this.coronary_calcium_score > 100;
  }

  // Retorna interpretação do CAC score
  getCACInterpretation() {
    if (this.coronary_calcium_score === null) return null;
    if (this.coronary_calcium_score === 0) return "Ausente (sem calcificação)";
    if (this.coronary_calcium_score > 0 && this.coronary_calcium_score <= 100) return "Baixo a moderado";
    if (this.coronary_calcium_score > 100 && this.coronary_calcium_score <= 400) return "Elevado";
    return "Muito elevado";
  }

  // Verifica se estenose carotídea é significativa (≥ 50%)
  hasSignificantCarotidStenosis() {
    return this.carotid_stenosis === true && 
           this.carotid_stenosis_percentage !== null && 
           this.carotid_stenosis_percentage >= 50;
  }

  // Auto-completa has_ascvd baseado nos eventos presentes
  autoCompleteHasAscvd() {
    if (this.has_ascvd === null) {
      this.has_ascvd = this.hasClinicalAscvd();
    }
  }

  // Valida consistência dos dados
  validate() {
    const errors = [];
    const warnings = [];

    if (!this.patient_id) {
      errors.push("ID do paciente é obrigatório");
    }

    // Valida formato de datas
    if (this.mi_date && !/^\d{4}-\d{2}-\d{2}$/.test(this.mi_date)) {
      errors.push("Data do IAM deve estar no formato YYYY-MM-DD");
    }
    if (this.stroke_date && !/^\d{4}-\d{2}-\d{2}$/.test(this.stroke_date)) {
      errors.push("Data do AVC deve estar no formato YYYY-MM-DD");
    }

    // Validações de revascularização
    if (this.revascularization === true && !this.revascularization_type) {
      warnings.push("Tipo de revascularização não informado");
    }
    const validRevTypes = ["pci", "cabg", "both"];
    if (this.revascularization_type && !validRevTypes.includes(this.revascularization_type)) {
      errors.push(`Tipo de revascularização inválido: ${this.revascularization_type}`);
    }

    // Validações de estenose carotídea
    if (this.carotid_stenosis === true && this.carotid_stenosis_percentage === null) {
      warnings.push("Percentual de estenose carotídea não informado");
    }
    if (this.carotid_stenosis_percentage !== null) {
      if (this.carotid_stenosis_percentage < 0 || this.carotid_stenosis_percentage > 100) {
        errors.push("Percentual de estenose carotídea deve estar entre 0 e 100");
      }
      if (this.carotid_stenosis === false || this.carotid_stenosis === null) {
        warnings.push("Percentual de estenose informado mas 'carotid_stenosis' é false/null");
      }
    }

    // Validações de CAC score
    if (this.coronary_calcium_score !== null) {
      if (this.coronary_calcium_score < 0) {
        errors.push("Escore de cálcio coronário não pode ser negativo");
      }
      if (this.coronary_calcium_score > 10000) {
        warnings.push("Escore de cálcio coronário muito elevado (> 10000) - verificar valor");
      }
    }

    // Validações de consistência
    if (this.has_ascvd === false && this.hasClinicalAscvd()) {
      warnings.push("'has_ascvd' é false mas há eventos ateroscleróticos registrados");
    }
    if (this.has_ascvd === true && !this.hasClinicalAscvd()) {
      warnings.push("'has_ascvd' é true mas não há eventos específicos registrados");
    }

    // Validações de eventos recorrentes
    if (this.recurrent_events === true && !this.hasClinicalAscvd()) {
      warnings.push("Eventos recorrentes informados mas não há evento inicial registrado");
    }

    // Validações de doença multiarterial
    if (this.multivessel_disease === true && !this.myocardial_infarction && !this.revascularization) {
      warnings.push("Doença multiarterial informada mas não há história coronariana registrada");
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
      has_ascvd: this.has_ascvd,
      myocardial_infarction: this.myocardial_infarction,
      mi_date: this.mi_date,
      ischemic_stroke: this.ischemic_stroke,
      stroke_date: this.stroke_date,
      unstable_angina: this.unstable_angina,
      revascularization: this.revascularization,
      revascularization_type: this.revascularization_type,
      peripheral_artery_disease: this.peripheral_artery_disease,
      carotid_stenosis: this.carotid_stenosis,
      carotid_stenosis_percentage: this.carotid_stenosis_percentage,
      aortic_aneurysm: this.aortic_aneurysm,
      carotid_plaque: this.carotid_plaque,
      coronary_calcium_score: this.coronary_calcium_score,
      lvh: this.lvh,
      recurrent_events: this.recurrent_events,
      multivessel_disease: this.multivessel_disease,
      notes: this.notes,
    };
  }
}

export default AtheroscleroticDisease;
