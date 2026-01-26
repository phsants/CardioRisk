// FamilyHistory Entity Schema
// Diretriz Brasileira de Dislipidemias SBC 2025

export const FamilyHistorySchema = {
  name: "FamilyHistory",
  type: "object",
  properties: {
    patient_id: {
      type: "string",
      description: "ID do paciente",
    },
    has_family_history_cad: {
      type: "boolean",
      description: "Histórico familiar de DAC precoce",
    },
    first_degree_relatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          relationship: {
            type: "string",
            enum: ["father", "mother", "brother", "sister"],
          },
          age_at_event: {
            type: "number",
          },
          event_type: {
            type: "string",
            enum: ["mi", "stroke", "sudden_death", "revascularization", "dyslipidemia"],
          },
        },
      },
      description: "Parentes de 1º grau afetados",
    },
    second_degree_relatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          relationship: {
            type: "string",
            enum: [
              "grandfather_paternal",
              "grandmother_paternal",
              "grandfather_maternal",
              "grandmother_maternal",
              "uncle",
              "aunt",
            ],
          },
          age_at_event: {
            type: "number",
          },
          event_type: {
            type: "string",
          },
        },
      },
      description: "Parentes de 2º grau afetados",
    },
    third_degree_relatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          relationship: {
            type: "string",
          },
          age_at_event: {
            type: "number",
          },
          event_type: {
            type: "string",
          },
        },
      },
      description: "Parentes de 3º grau afetados",
    },
    suspected_familial_hypercholesterolemia: {
      type: "boolean",
      description: "Suspeita de hipercolesterolemia familiar",
    },
    fh_dutch_score: {
      type: "number",
      description: "Escore de Dutch Lipid Clinic",
    },
    premature_cad_male: {
      type: "boolean",
      description: "DAC precoce em homem (<55 anos)",
    },
    premature_cad_female: {
      type: "boolean",
      description: "DAC precoce em mulher (<65 anos)",
    },
    notes: {
      type: "string",
      description: "Observações sobre história familiar",
    },
  },
  required: ["patient_id"],
};

// Helper class for FamilyHistory entity
export class FamilyHistory {
  constructor(data = {}) {
    this.patient_id = data.patient_id || null;
    this.has_family_history_cad = data.has_family_history_cad ?? null;
    this.first_degree_relatives = data.first_degree_relatives || [];
    this.second_degree_relatives = data.second_degree_relatives || [];
    this.third_degree_relatives = data.third_degree_relatives || [];
    this.suspected_familial_hypercholesterolemia = data.suspected_familial_hypercholesterolemia ?? null;
    this.fh_dutch_score = data.fh_dutch_score || null;
    this.premature_cad_male = data.premature_cad_male ?? null;
    this.premature_cad_female = data.premature_cad_female ?? null;
    this.notes = data.notes || null;
  }

  // Verifica se há DAC precoce em parentes de 1º grau
  hasPrematureCadFirstDegree() {
    if (!Array.isArray(this.first_degree_relatives)) return false;
    return this.first_degree_relatives.some((relative) => {
      const age = relative.age_at_event;
      const relationship = relative.relationship;
      const isMale = relationship === "father" || relationship === "brother";
      return (isMale && age < 55) || (!isMale && age < 65);
    });
  }

  // Conta parentes de 1º grau com DAC precoce
  countPrematureCadFirstDegree() {
    if (!Array.isArray(this.first_degree_relatives)) return 0;
    return this.first_degree_relatives.filter((relative) => {
      const age = relative.age_at_event;
      const relationship = relative.relationship;
      const isMale = relationship === "father" || relationship === "brother";
      return (isMale && age < 55) || (!isMale && age < 65);
    }).length;
  }

  // Retorna todos os parentes afetados (todos os graus)
  getAllAffectedRelatives() {
    return [
      ...(this.first_degree_relatives || []).map((r) => ({ ...r, degree: 1 })),
      ...(this.second_degree_relatives || []).map((r) => ({ ...r, degree: 2 })),
      ...(this.third_degree_relatives || []).map((r) => ({ ...r, degree: 3 })),
    ];
  }

  // Retorna parentes de 1º grau com dislipidemia
  getFirstDegreeWithDyslipidemia() {
    if (!Array.isArray(this.first_degree_relatives)) return [];
    return this.first_degree_relatives.filter(
      (r) => r.event_type === "dyslipidemia"
    );
  }

  // Verifica se há múltiplos parentes de 1º grau afetados
  hasMultipleFirstDegreeAffected() {
    return Array.isArray(this.first_degree_relatives) && this.first_degree_relatives.length >= 2;
  }

  // Retorna interpretação do escore Dutch Lipid Clinic
  getDutchScoreInterpretation() {
    if (this.fh_dutch_score === null || this.fh_dutch_score === undefined) return null;
    if (this.fh_dutch_score >= 8) return "Definitiva (≥ 8 pontos)";
    if (this.fh_dutch_score >= 6) return "Provável (6-7 pontos)";
    if (this.fh_dutch_score >= 3) return "Possível (3-5 pontos)";
    return "Improvável (< 3 pontos)";
  }

  // Auto-completa has_family_history_cad baseado nos parentes
  autoCompleteHasFamilyHistory() {
    if (this.has_family_history_cad === null) {
      const hasFirstDegree = Array.isArray(this.first_degree_relatives) && this.first_degree_relatives.length > 0;
      const hasSecondDegree = Array.isArray(this.second_degree_relatives) && this.second_degree_relatives.length > 0;
      const hasThirdDegree = Array.isArray(this.third_degree_relatives) && this.third_degree_relatives.length > 0;
      this.has_family_history_cad = hasFirstDegree || hasSecondDegree || hasThirdDegree;
    }
  }

  // Auto-completa premature_cad flags baseado nos parentes
  autoCompletePrematureCadFlags() {
    if (this.premature_cad_male === null || this.premature_cad_female === null) {
      if (Array.isArray(this.first_degree_relatives)) {
        const prematureMales = this.first_degree_relatives.filter((r) => {
          const isMale = r.relationship === "father" || r.relationship === "brother";
          return isMale && r.age_at_event && r.age_at_event < 55;
        });
        const prematureFemales = this.first_degree_relatives.filter((r) => {
          const isFemale = r.relationship === "mother" || r.relationship === "sister";
          return isFemale && r.age_at_event && r.age_at_event < 65;
        });

        if (this.premature_cad_male === null) {
          this.premature_cad_male = prematureMales.length > 0;
        }
        if (this.premature_cad_female === null) {
          this.premature_cad_female = prematureFemales.length > 0;
        }
      }
    }
  }

  // Retorna resumo da história familiar
  getSummary() {
    const summary = {
      hasFamilyHistory: this.has_family_history_cad === true,
      firstDegreeCount: Array.isArray(this.first_degree_relatives) ? this.first_degree_relatives.length : 0,
      secondDegreeCount: Array.isArray(this.second_degree_relatives) ? this.second_degree_relatives.length : 0,
      thirdDegreeCount: Array.isArray(this.third_degree_relatives) ? this.third_degree_relatives.length : 0,
      prematureCad: this.hasPrematureCadFirstDegree(),
      suspectedFH: this.suspected_familial_hypercholesterolemia === true,
      dutchScore: this.fh_dutch_score,
      dutchInterpretation: this.getDutchScoreInterpretation(),
    };
    return summary;
  }

  // Valida consistência dos dados
  validate() {
    const errors = [];
    const warnings = [];

    if (!this.patient_id) {
      errors.push("ID do paciente é obrigatório");
    }

    // Validações de parentes de 1º grau
    if (Array.isArray(this.first_degree_relatives)) {
      const validRelationships = ["father", "mother", "brother", "sister"];
      const validEventTypes = ["mi", "stroke", "sudden_death", "revascularization", "dyslipidemia"];

      this.first_degree_relatives.forEach((relative, index) => {
        if (!relative.relationship || !validRelationships.includes(relative.relationship)) {
          errors.push(`Parente de 1º grau #${index + 1}: relacionamento inválido`);
        }
        if (relative.age_at_event !== null && relative.age_at_event !== undefined) {
          if (relative.age_at_event < 0 || relative.age_at_event > 120) {
            warnings.push(`Parente de 1º grau #${index + 1}: idade no evento fora da faixa esperada`);
          }
        }
        if (relative.event_type && !validEventTypes.includes(relative.event_type)) {
          errors.push(`Parente de 1º grau #${index + 1}: tipo de evento inválido`);
        }
      });
    }

    // Validações de parentes de 2º grau
    if (Array.isArray(this.second_degree_relatives)) {
      const validRelationships = [
        "grandfather_paternal",
        "grandmother_paternal",
        "grandfather_maternal",
        "grandmother_maternal",
        "uncle",
        "aunt",
      ];

      this.second_degree_relatives.forEach((relative, index) => {
        if (!relative.relationship || !validRelationships.includes(relative.relationship)) {
          errors.push(`Parente de 2º grau #${index + 1}: relacionamento inválido`);
        }
        if (relative.age_at_event !== null && relative.age_at_event !== undefined) {
          if (relative.age_at_event < 0 || relative.age_at_event > 120) {
            warnings.push(`Parente de 2º grau #${index + 1}: idade no evento fora da faixa esperada`);
          }
        }
      });
    }

    // Validações de consistência
    if (this.has_family_history_cad === true) {
      const totalRelatives =
        (Array.isArray(this.first_degree_relatives) ? this.first_degree_relatives.length : 0) +
        (Array.isArray(this.second_degree_relatives) ? this.second_degree_relatives.length : 0) +
        (Array.isArray(this.third_degree_relatives) ? this.third_degree_relatives.length : 0);

      if (totalRelatives === 0) {
        warnings.push("'has_family_history_cad' é true mas não há parentes registrados");
      }
    }

    if (this.has_family_history_cad === false) {
      const totalRelatives =
        (Array.isArray(this.first_degree_relatives) ? this.first_degree_relatives.length : 0) +
        (Array.isArray(this.second_degree_relatives) ? this.second_degree_relatives.length : 0) +
        (Array.isArray(this.third_degree_relatives) ? this.third_degree_relatives.length : 0);

      if (totalRelatives > 0) {
        warnings.push("'has_family_history_cad' é false mas há parentes registrados");
      }
    }

    // Validações de escore Dutch
    if (this.fh_dutch_score !== null && this.fh_dutch_score !== undefined) {
      if (this.fh_dutch_score < 0 || this.fh_dutch_score > 20) {
        warnings.push(`Escore Dutch Lipid Clinic fora da faixa esperada: ${this.fh_dutch_score}`);
      }
    }

    // Validações de flags de DAC precoce
    if (this.premature_cad_male === true || this.premature_cad_female === true) {
      if (!this.hasPrematureCadFirstDegree()) {
        warnings.push("Flags de DAC precoce estão true mas não há parentes de 1º grau com DAC precoce registrado");
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
      has_family_history_cad: this.has_family_history_cad,
      first_degree_relatives: this.first_degree_relatives,
      second_degree_relatives: this.second_degree_relatives,
      third_degree_relatives: this.third_degree_relatives,
      suspected_familial_hypercholesterolemia: this.suspected_familial_hypercholesterolemia,
      fh_dutch_score: this.fh_dutch_score,
      premature_cad_male: this.premature_cad_male,
      premature_cad_female: this.premature_cad_female,
      notes: this.notes,
    };
  }
}

export default FamilyHistory;
