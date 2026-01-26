// Patient Entity Schema
// Diretriz Brasileira de Dislipidemias SBC 2025

export const PatientSchema = {
  name: "Patient",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Nome do paciente",
    },
    birth_date: {
      type: "string",
      format: "date",
      description: "Data de nascimento",
    },
    sex: {
      type: "string",
      enum: ["masculino", "feminino"],
      description: "Sexo biológico",
    },
    weight: {
      type: "number",
      description: "Peso em kg",
    },
    height: {
      type: "number",
      description: "Altura em cm",
    },
    waist_circumference: {
      type: "number",
      description: "Circunferência abdominal em cm",
    },
    menopause_status: {
      type: "string",
      enum: ["pre_menopause", "post_menopause", "uncertain", "not_applicable"],
      description: "Status da menopausa (para mulheres)",
    },
    notes: {
      type: "string",
      description: "Observações adicionais",
    },
  },
  required: ["name", "sex"],
};

// Helper class for Patient entity
export class Patient {
  constructor(data = {}) {
    this.name = data.name || null;
    this.birth_date = data.birth_date || null;
    this.sex = data.sex || null;
    this.weight = data.weight || null;
    this.height = data.height || null;
    this.waist_circumference = data.waist_circumference || null;
    this.menopause_status = data.menopause_status || null;
    this.notes = data.notes || null;
  }

  // Calcula idade a partir da data de nascimento
  getAge() {
    if (!this.birth_date) return null;
    const today = new Date();
    const birth = new Date(this.birth_date);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Calcula IMC
  getBMI() {
    if (!this.weight || !this.height) return null;
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }

  // Valida se os dados obrigatórios estão presentes
  validate() {
    const errors = [];
    if (!this.name) errors.push("Nome é obrigatório");
    if (!this.sex) errors.push("Sexo é obrigatório");
    if (this.sex && !["masculino", "feminino"].includes(this.sex)) {
      errors.push("Sexo deve ser 'masculino' ou 'feminino'");
    }
    if (this.menopause_status && !["pre_menopause", "post_menopause", "uncertain", "not_applicable"].includes(this.menopause_status)) {
      errors.push("Status da menopausa inválido");
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      name: this.name,
      birth_date: this.birth_date,
      sex: this.sex,
      weight: this.weight,
      height: this.height,
      waist_circumference: this.waist_circumference,
      menopause_status: this.menopause_status,
      notes: this.notes,
    };
  }
}

export default Patient;
