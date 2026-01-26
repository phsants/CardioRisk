// Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose - SBC 2025
// Dados estruturados completos

export const GUIDELINE_VERSION = "SBC_2025";

// Categorias de Risco Cardiovascular
export const RISK_CATEGORIES = {
  low: {
    id: "low",
    name: "Baixo Risco",
    description: "Pacientes sem fatores de risco cardiovascular significativos",
    color: "#22C55E",
    ldl_target: 130,
    non_hdl_target: 160,
    apo_b_target: 120,
  },
  intermediate: {
    id: "intermediate",
    name: "Risco Intermediário",
    description: "Pacientes com fatores de risco tradicionais, sem doença aterosclerótica",
    color: "#F59E0B",
    ldl_target: 100,
    non_hdl_target: 130,
    apo_b_target: 100,
  },
  high: {
    id: "high",
    name: "Alto Risco",
    description: "Pacientes com condições que elevam significativamente o risco cardiovascular",
    color: "#F97316",
    ldl_target: 70,
    non_hdl_target: 100,
    apo_b_target: 80,
  },
  very_high: {
    id: "very_high",
    name: "Muito Alto Risco",
    description: "Pacientes com doença aterosclerótica clínica estabelecida",
    color: "#EF4444",
    ldl_target: 50,
    non_hdl_target: 80,
    apo_b_target: 65,
  },
  extreme: {
    id: "extreme",
    name: "Risco Extremo",
    description: "Pacientes com eventos recorrentes ou doença aterosclerótica acelerada",
    color: "#7F1D1D",
    ldl_target: 30,
    non_hdl_target: 60,
    apo_b_target: 55,
  },
};

// Critérios de Risco Extremo
export const EXTREME_RISK_CRITERIA = [
  {
    id: "recurrent_events_on_treatment",
    description: "Eventos cardiovasculares recorrentes em uso otimizado de hipolipemiantes",
    weight: 1,
  },
  {
    id: "polyvascular_disease",
    description: "Doença aterosclerótica clinicamente significativa em múltiplos territórios vasculares",
    weight: 1,
  },
  {
    id: "ascvd_plus_dm_plus_complications",
    description: "DASC + Diabetes com complicações microvasculares ou múltiplos fatores de risco",
    weight: 1,
  },
  {
    id: "familial_hypercholesterolemia_plus_ascvd",
    description: "Hipercolesterolemia familiar + doença aterosclerótica clínica",
    weight: 1,
  },
  {
    id: "ldl_persistently_elevated",
    description: "LDL-c persistentemente ≥ 300 mg/dL apesar de terapia máxima",
    weight: 1,
  },
];

// Critérios de Muito Alto Risco
export const VERY_HIGH_RISK_CRITERIA = [
  {
    id: "clinical_ascvd",
    description: "Doença aterosclerótica clínica (IAM, AVC, DAP, revascularização)",
    weight: 1,
  },
  {
    id: "subclinical_atherosclerosis",
    description: "Aterosclerose subclínica significativa (CAC > 100, placas carotídeas)",
    weight: 1,
  },
  {
    id: "familial_hypercholesterolemia",
    description: "Hipercolesterolemia familiar sem DASC",
    weight: 1,
  },
  {
    id: "dm_with_tod_or_long_duration",
    description: "Diabetes + lesão de órgão-alvo OU > 10 anos de duração",
    weight: 1,
  },
  {
    id: "ckd_stage_4_5",
    description: "Doença renal crônica estágio 4-5 (TFG < 30 mL/min/1.73m²)",
    weight: 1,
  },
];

// Critérios de Alto Risco
export const HIGH_RISK_CRITERIA = [
  {
    id: "diabetes_without_tod",
    description: "Diabetes mellitus sem lesão de órgão-alvo",
    weight: 1,
  },
  {
    id: "ckd_stage_3",
    description: "Doença renal crônica estágio 3 (TFG 30-59 mL/min/1.73m²)",
    weight: 1,
  },
  {
    id: "ldl_above_190",
    description: "LDL-c ≥ 190 mg/dL",
    weight: 1,
  },
  {
    id: "lp_a_elevated",
    description: "Lipoproteína(a) elevada (> 50 mg/dL ou > 125 nmol/L)",
    weight: 1,
  },
  {
    id: "score2_high",
    description: "Escore de risco SCORE2 ou SCORE2-OP elevado (≥ 7.5%)",
    weight: 1,
  },
];

// Critérios de Risco Intermediário
export const INTERMEDIATE_RISK_CRITERIA = [
  {
    id: "multiple_risk_factors",
    description: "Múltiplos fatores de risco tradicionais",
    weight: 1,
  },
  {
    id: "score2_intermediate",
    description: "Escore de risco SCORE2 intermediário (2.5-7.5%)",
    weight: 1,
  },
  {
    id: "metabolic_syndrome",
    description: "Síndrome metabólica",
    weight: 0.5,
  },
  {
    id: "postmenopausal_with_risk",
    description: "Mulher pós-menopausa com fatores de risco adicionais",
    weight: 0.5,
  },
];

// Fatores Modificadores de Risco (que podem aumentar a categoria)
export const RISK_MODIFIERS = [
  {
    id: "cac_elevated",
    description: "Escore de cálcio coronário > 100",
    action: "upgrade_one_category",
  },
  {
    id: "carotid_plaque",
    description: "Placa aterosclerótica em carótidas",
    action: "upgrade_to_very_high",
  },
  {
    id: "ankle_brachial_index_low",
    description: "Índice tornozelo-braquial < 0.9",
    action: "upgrade_one_category",
  },
  {
    id: "family_history_premature_cad",
    description: "História familiar de DAC precoce (homem < 55, mulher < 65 anos)",
    action: "upgrade_one_category",
  },
  {
    id: "high_sensitivity_crp_elevated",
    description: "PCR-us persistentemente elevada",
    action: "consider_upgrade",
  },
  {
    id: "hypertriglyceridemia_severe",
    description: "Triglicerídeos ≥ 500 mg/dL",
    action: "metabolic_alert",
  },
];

// Limites de referência para perfil lipídico
export const LIPID_REFERENCE_VALUES = {
  total_cholesterol: {
    desirable: { max: 190 },
    borderline: { min: 190, max: 239 },
    elevated: { min: 240 },
  },
  ldl_c: {
    optimal: { max: 100 },
    near_optimal: { min: 100, max: 129 },
    borderline_high: { min: 130, max: 159 },
    high: { min: 160, max: 189 },
    very_high: { min: 190 },
  },
  hdl_c: {
    low: { max: 40 },
    normal: { min: 40, max: 60 },
    high: { min: 60 },
  },
  triglycerides: {
    normal: { max: 150 },
    borderline: { min: 150, max: 199 },
    high: { min: 200, max: 499 },
    very_high: { min: 500 },
  },
  non_hdl_c: {
    optimal: { max: 130 },
    elevated: { min: 130 },
  },
  lp_a: {
    normal_nmol: { max: 75 },
    elevated_nmol: { min: 75, max: 125 },
    high_nmol: { min: 125 },
    normal_mg: { max: 30 },
    elevated_mg: { min: 30, max: 50 },
    high_mg: { min: 50 },
  },
  apo_b: {
    optimal: { max: 100 },
    elevated: { min: 100 },
  },
};

// Critérios para Síndrome Metabólica (IDF / NCEP ATP III adaptados)
export const METABOLIC_SYNDROME_CRITERIA = {
  waist_circumference: {
    male: 90,
    female: 80,
  },
  triglycerides: 150,
  hdl_c: {
    male: 40,
    female: 50,
  },
  blood_pressure: {
    systolic: 130,
    diastolic: 85,
  },
  fasting_glucose: 100,
};

// Critérios Dutch Lipid Clinic para HF
export const DUTCH_LIPID_CLINIC_CRITERIA = {
  family_history: {
    first_degree_relative_premature_cad: 1,
    first_degree_relative_ldl_above_percentile: 1,
    first_degree_relative_tendon_xanthoma: 2,
    child_with_ldl_above_percentile: 2,
  },
  personal_history: {
    premature_cad: 2,
    premature_cerebrovascular_disease: 1,
    premature_peripheral_vascular_disease: 1,
  },
  physical_examination: {
    tendon_xanthoma: 6,
    arcus_cornealis_before_45: 4,
  },
  ldl_levels: {
    above_330: 8,
    "250-329": 5,
    "190-249": 3,
    "155-189": 1,
  },
  genetic_testing: {
    mutation_positive: 8,
  },
  scoring: {
    definite: { min: 8 },
    probable: { min: 6, max: 7 },
    possible: { min: 3, max: 5 },
  },
};

// Perguntas adaptativas para triagem
export const SCREENING_QUESTIONS = {
  demographics: [
    {
      id: "age",
      question: "Qual a idade do paciente?",
      type: "number",
      required: true,
      unit: "anos",
    },
    {
      id: "sex",
      question: "Qual o sexo biológico?",
      type: "select",
      options: [
        { value: "masculino", label: "Masculino" },
        { value: "feminino", label: "Feminino" },
      ],
      required: true,
    },
    {
      id: "menopause_status",
      question: "Qual o status da menopausa?",
      type: "select",
      options: [
        { value: "pre_menopause", label: "Pré-menopausa" },
        { value: "post_menopause", label: "Pós-menopausa" },
        { value: "uncertain", label: "Incerto" },
      ],
      condition: { field: "sex", value: "feminino" },
      required: true,
    },
  ],
  anthropometry: [
    {
      id: "weight",
      question: "Peso do paciente",
      type: "number",
      unit: "kg",
      required: false,
    },
    {
      id: "height",
      question: "Altura do paciente",
      type: "number",
      unit: "cm",
      required: false,
    },
    {
      id: "waist_circumference",
      question: "Circunferência abdominal",
      type: "number",
      unit: "cm",
      required: false,
    },
  ],
  lipid_panel: [
    {
      id: "fasting",
      question: "O exame foi feito em jejum?",
      type: "boolean",
      required: true,
    },
    {
      id: "total_cholesterol",
      question: "Colesterol Total",
      type: "number",
      unit: "mg/dL",
      required: false,
    },
    {
      id: "ldl_c",
      question: "LDL-c",
      type: "number",
      unit: "mg/dL",
      required: true,
    },
    {
      id: "hdl_c",
      question: "HDL-c",
      type: "number",
      unit: "mg/dL",
      required: true,
    },
    {
      id: "triglycerides",
      question: "Triglicerídeos",
      type: "number",
      unit: "mg/dL",
      required: true,
      alert: {
        condition: { operator: ">=", value: 400 },
        message: "TG muito elevado - verificar jejum e investigar causas secundárias",
      },
    },
    {
      id: "apo_b",
      question: "ApoB (se disponível)",
      type: "number",
      unit: "mg/dL",
      required: false,
    },
    {
      id: "has_lp_a",
      question: "A Lipoproteína(a) já foi medida?",
      type: "boolean",
      required: true,
    },
    {
      id: "lp_a_value",
      question: "Valor da Lipoproteína(a)",
      type: "number",
      unit: "nmol/L",
      condition: { field: "has_lp_a", value: true },
      required: true,
    },
    {
      id: "lp_a_unit",
      question: "Unidade da Lp(a)",
      type: "select",
      options: [
        { value: "nmol_l", label: "nmol/L" },
        { value: "mg_dl", label: "mg/dL" },
      ],
      condition: { field: "has_lp_a", value: true },
      required: true,
    },
  ],
  clinical_history: [
    {
      id: "has_diabetes",
      question: "O paciente tem Diabetes?",
      type: "boolean",
      required: true,
    },
    {
      id: "diabetes_duration",
      question: "Há quantos anos tem diabetes?",
      type: "number",
      unit: "anos",
      condition: { field: "has_diabetes", value: true },
      required: true,
    },
    {
      id: "diabetes_complications",
      question: "Possui complicações microvasculares do diabetes?",
      type: "multiselect",
      options: [
        { value: "retinopathy", label: "Retinopatia" },
        { value: "nephropathy", label: "Nefropatia" },
        { value: "neuropathy", label: "Neuropatia" },
        { value: "none", label: "Nenhuma" },
      ],
      condition: { field: "has_diabetes", value: true },
      required: true,
    },
    {
      id: "has_hypertension",
      question: "O paciente tem Hipertensão Arterial?",
      type: "boolean",
      required: true,
    },
    {
      id: "is_current_smoker",
      question: "O paciente fuma atualmente?",
      type: "boolean",
      required: true,
    },
    {
      id: "is_former_smoker",
      question: "O paciente é ex-fumante?",
      type: "boolean",
      condition: { field: "is_current_smoker", value: false },
      required: true,
    },
    {
      id: "years_since_quit",
      question: "Há quantos anos parou de fumar?",
      type: "number",
      unit: "anos",
      condition: { field: "is_former_smoker", value: true },
      required: false,
    },
    {
      id: "has_ckd",
      question: "O paciente tem Doença Renal Crônica?",
      type: "boolean",
      required: true,
    },
    {
      id: "ckd_stage",
      question: "Qual o estágio da DRC?",
      type: "select",
      options: [
        { value: "1", label: "Estágio 1 (TFG ≥ 90)" },
        { value: "2", label: "Estágio 2 (TFG 60-89)" },
        { value: "3a", label: "Estágio 3a (TFG 45-59)" },
        { value: "3b", label: "Estágio 3b (TFG 30-44)" },
        { value: "4", label: "Estágio 4 (TFG 15-29)" },
        { value: "5", label: "Estágio 5 (TFG < 15)" },
      ],
      condition: { field: "has_ckd", value: true },
      required: true,
    },
  ],
  atherosclerotic_disease: [
    {
      id: "has_ascvd",
      question: "O paciente já teve algum evento cardiovascular?",
      type: "boolean",
      required: true,
      description: "IAM, AVC, angina, revascularização, DAP, etc.",
    },
    {
      id: "ascvd_type",
      question: "Quais eventos o paciente já teve?",
      type: "multiselect",
      options: [
        { value: "mi", label: "Infarto Agudo do Miocárdio" },
        { value: "stroke", label: "AVC Isquêmico" },
        { value: "unstable_angina", label: "Angina Instável" },
        { value: "revascularization", label: "Revascularização (Stent/Cirurgia)" },
        { value: "pad", label: "Doença Arterial Periférica" },
        { value: "carotid_stenosis", label: "Estenose de Carótida" },
        { value: "aortic_aneurysm", label: "Aneurisma de Aorta" },
      ],
      condition: { field: "has_ascvd", value: true },
      required: true,
    },
    {
      id: "recurrent_events",
      question: "O paciente teve eventos cardiovasculares recorrentes?",
      type: "boolean",
      condition: { field: "has_ascvd", value: true },
      required: true,
    },
    {
      id: "multivessel_disease",
      question: "Possui doença multiarterial coronariana?",
      type: "boolean",
      condition: { field: "has_ascvd", value: true },
      required: false,
    },
  ],
  imaging_markers: [
    {
      id: "has_cac",
      question: "O paciente tem escore de cálcio coronário?",
      type: "boolean",
      required: false,
    },
    {
      id: "cac_score",
      question: "Qual o valor do CAC?",
      type: "number",
      condition: { field: "has_cac", value: true },
      required: true,
    },
    {
      id: "has_carotid_us",
      question: "O paciente tem ultrassom de carótidas?",
      type: "boolean",
      required: false,
    },
    {
      id: "carotid_plaque",
      question: "Há presença de placa nas carótidas?",
      type: "boolean",
      condition: { field: "has_carotid_us", value: true },
      required: true,
    },
    {
      id: "carotid_imt_elevated",
      question: "Há espessamento médio-intimal significativo?",
      type: "boolean",
      condition: { field: "has_carotid_us", value: true },
      required: false,
    },
  ],
  family_history: [
    {
      id: "has_family_history_cad",
      question: "Há histórico familiar de doença cardiovascular precoce?",
      type: "boolean",
      required: true,
      description: "Homem < 55 anos ou Mulher < 65 anos",
    },
    {
      id: "affected_relatives",
      question: "Quais parentes foram afetados?",
      type: "multiselect",
      options: [
        { value: "father", label: "Pai" },
        { value: "mother", label: "Mãe" },
        { value: "brother", label: "Irmão" },
        { value: "sister", label: "Irmã" },
        { value: "grandfather", label: "Avô" },
        { value: "grandmother", label: "Avó" },
        { value: "uncle_aunt", label: "Tio/Tia" },
      ],
      condition: { field: "has_family_history_cad", value: true },
      required: true,
    },
    {
      id: "family_ldl_very_high",
      question: "Algum familiar tem LDL-c muito elevado (≥ 190 mg/dL)?",
      type: "boolean",
      condition: { field: "has_family_history_cad", value: true },
      required: true,
    },
    {
      id: "suspected_fh",
      question: "Há suspeita de Hipercolesterolemia Familiar?",
      type: "boolean",
      required: false,
    },
  ],
};

// Fórmulas e cálculos
export const CALCULATIONS = {
  // Cálculo de IMC
  bmi: (weight, heightCm) => {
    const heightM = heightCm / 100;
    return weight / (heightM * heightM);
  },
  // Cálculo de Não-HDL-c
  nonHdlC: (totalCholesterol, hdlC) => {
    return totalCholesterol - hdlC;
  },
  // Estimativa de ApoB a partir de Não-HDL-c (quando não disponível)
  estimatedApoB: (nonHdlC) => {
    return nonHdlC * 0.8;
  },
  // Fórmula de Friedewald para LDL-c (quando não medido diretamente)
  friedewaldLdl: (totalCholesterol, hdlC, triglycerides) => {
    if (triglycerides > 400) return null; // Não válido se TG > 400
    return totalCholesterol - hdlC - (triglycerides / 5);
  },
  // Conversão de Lp(a)
  lpAConversion: {
    nmolToMg: (nmol) => nmol / 2.5,
    mgToNmol: (mg) => mg * 2.5,
  },
  // Avaliação de Síndrome Metabólica
  metabolicSyndromeCheck: (data) => {
    let criteria = 0;
    const thresholds = METABOLIC_SYNDROME_CRITERIA;
    
    if (data.sex === "masculino" && data.waist_circumference >= thresholds.waist_circumference.male) criteria++;
    if (data.sex === "feminino" && data.waist_circumference >= thresholds.waist_circumference.female) criteria++;
    if (data.triglycerides >= thresholds.triglycerides) criteria++;
    if (data.sex === "masculino" && data.hdl_c < thresholds.hdl_c.male) criteria++;
    if (data.sex === "feminino" && data.hdl_c < thresholds.hdl_c.female) criteria++;
    if (data.has_hypertension) criteria++;
    if (data.fasting_glucose >= thresholds.fasting_glucose) criteria++;
    
    return {
      present: criteria >= 3,
      criteriaCount: criteria,
    };
  },
};

export default {
  GUIDELINE_VERSION,
  RISK_CATEGORIES,
  EXTREME_RISK_CRITERIA,
  VERY_HIGH_RISK_CRITERIA,
  HIGH_RISK_CRITERIA,
  INTERMEDIATE_RISK_CRITERIA,
  RISK_MODIFIERS,
  LIPID_REFERENCE_VALUES,
  METABOLIC_SYNDROME_CRITERIA,
  DUTCH_LIPID_CLINIC_CRITERIA,
  SCREENING_QUESTIONS,
  CALCULATIONS,
};
