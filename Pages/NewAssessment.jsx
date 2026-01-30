import React, { useState, useEffect } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { createPageUrl } from "@/utils";

import AdaptiveScreening from "@/components/screening/AdaptiveScreening";

import RiskResultCard from "@/components/results/RiskResultCard";

import MissingDataCard from "@/components/results/MissingDataCard";

import AssessmentSummary from "@/components/results/AssessmentSummary";

import RiskEngine from "@/components/guidelines/RiskEngine";

import { RISK_CATEGORIES } from "@/components/guidelines/GuidelineData";

import { 

  ArrowLeft, 

  RotateCcw,

  ChevronRight

} from "lucide-react";

import { api } from "@/services/api";

// Funções para salvar dados
const savePatient = async (patientData) => {
  // Por enquanto, não precisamos salvar paciente separadamente
  // Os dados do paciente vão junto com a avaliação
  return { id: null };
};

const saveLipidPanel = async (lipidData) => {
  // Por enquanto, não precisamos salvar perfil lipídico separadamente
  // Os dados vão junto com a avaliação
  return { id: null };
};

const saveRiskAssessment = async (assessmentData) => {
  try {
    const response = await api.post('/assessments', {
      assessmentData: assessmentData.assessment_data || assessmentData,
      riskClassification: assessmentData.risk_classification,
      patientId: null, // Por enquanto não salvamos paciente separadamente
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw error;
  }
};

// Converte assessment_data do backend (formato aninhado) para o formato flat do formulário
function assessmentDataToScreeningData(assessmentData) {
  if (!assessmentData) return {};
  const p = assessmentData.patient || {};
  const lip = assessmentData.lipids || {};
  const cl = assessmentData.clinical || {};
  const img = assessmentData.imaging || {};
  const fh = assessmentData.familyHistory || {};
  return {
    patient_name: assessmentData.patient_name ?? p.patient_name ?? null,
    age: p.age,
    sex: p.sex,
    menopause_status: p.menopause_status,
    weight: p.weight,
    height: p.height,
    waist_circumference: p.waist_circumference,
    fasting: lip.fasting,
    total_cholesterol: lip.total_cholesterol,
    ldl_c: lip.ldl_c,
    hdl_c: lip.hdl_c,
    triglycerides: lip.triglycerides,
    non_hdl_c: lip.non_hdl_c,
    apo_b: lip.apo_b,
    has_lp_a: lip.has_lp_a,
    lp_a_value: lip.lp_a_value,
    lp_a_unit: lip.lp_a_unit,
    has_diabetes: cl.has_diabetes,
    diabetes_duration: cl.diabetes_duration,
    diabetes_complications: cl.diabetes_complications,
    has_hypertension: cl.has_hypertension,
    systolic_bp: cl.systolic_bp,
    hypertension_treated: cl.hypertension_treated,
    is_current_smoker: cl.is_current_smoker,
    is_former_smoker: cl.is_former_smoker,
    years_since_quit: cl.years_since_quit,
    has_ckd: cl.has_ckd,
    ckd_stage: cl.ckd_stage,
    has_ascvd: cl.has_ascvd,
    ascvd_type: cl.ascvd_type,
    recurrent_events: cl.recurrent_events,
    multivessel_disease: cl.multivessel_disease,
    has_pancreatitis_history: cl.has_pancreatitis_history,
    recurrent_abdominal_pain: cl.recurrent_abdominal_pain,
    symptom_onset_age: cl.symptom_onset_age,
    tg_previous_measurements: cl.tg_previous_measurements,
    tg_highest_value: cl.tg_highest_value,
    tg_previous_low: cl.tg_previous_low,
    has_secondary_factors: cl.has_secondary_factors,
    has_combined_familial_hyperlipidemia: cl.has_combined_familial_hyperlipidemia,
    lipid_therapy_response: cl.lipid_therapy_response,
    tg_reduction_percentage: cl.tg_reduction_percentage,
    has_cac: img.has_cac,
    cac_score: img.cac_score,
    has_carotid_us: img.has_carotid_us,
    carotid_plaque: img.carotid_plaque,
    carotid_stenosis_percent: img.carotid_stenosis_percent,
    carotid_imt_elevated: img.carotid_imt_elevated,
    has_abdominal_aneurysm: img.has_abdominal_aneurysm,
    has_family_history_cad: fh.has_family_history_cad,
    affected_relatives: fh.affected_relatives,
    family_ldl_very_high: fh.family_ldl_very_high,
    suspected_fh: fh.suspected_fh,
  };
}

// Monta objeto assessment para exibição a partir da resposta da API
function buildAssessmentFromApi(apiAssessment) {
  const ad = apiAssessment.assessment_data || {};
  const cat = apiAssessment.risk_category || apiAssessment.risk_classification?.category;
  const catInfo = RISK_CATEGORIES[cat] || {};
  const rc = apiAssessment.risk_classification;
  const ldlCurrent = apiAssessment.ldl_current ?? ad.lipids?.ldl_c;
  const ldlTarget = apiAssessment.ldl_target ?? rc?.ldl_target ?? catInfo.ldl_target;
  const ldlAtTarget = apiAssessment.ldl_at_target ?? (ldlCurrent != null && ldlTarget != null && ldlCurrent <= ldlTarget);
  const reductionNeeded = ldlCurrent != null && ldlTarget != null && !ldlAtTarget && ldlCurrent > 0
    ? Math.round(((ldlCurrent - ldlTarget) / ldlCurrent) * 100)
    : null;
  const nonHdlCurrent = ad.lipids?.non_hdl_c;
  const nonHdlTarget = catInfo.non_hdl_target ?? 999;
  const apoBCurrent = ad.lipids?.apo_b;
  const apoBTarget = catInfo.apo_b_target ?? 999;
  return {
    risk_classification: {
      category: cat,
      name: rc?.name ?? catInfo.name ?? cat,
      ldl_target: ldlTarget,
      non_hdl_target: catInfo.non_hdl_target,
      apo_b_target: catInfo.apo_b_target,
      risk_percentage_10y: apiAssessment.risk_percentage_10y ?? rc?.risk_percentage_10y,
      risk_score: apiAssessment.risk_score ?? rc?.risk_score,
      upgraded: rc?.upgraded,
      originalCategory: rc?.originalCategory,
    },
    derived_values: { non_hdl_c: ad.lipids?.non_hdl_c },
    missing_data: [],
    alerts: ad?.alerts || [],
    assessment_date: apiAssessment.created_at || apiAssessment.assessment_date,
    guideline_version: ad?.guideline_version || "SBC_2025",
    lipid_targets: {
      ldl_c: {
        current: ldlCurrent,
        target: ldlTarget,
        at_target: ldlAtTarget,
        reduction_needed: reductionNeeded,
      },
      non_hdl_c: nonHdlCurrent != null ? {
        current: nonHdlCurrent,
        target: nonHdlTarget,
        at_target: nonHdlCurrent <= nonHdlTarget,
      } : { current: null, target: nonHdlTarget, at_target: null },
      apo_b: apoBCurrent != null ? {
        current: apoBCurrent,
        target: apoBTarget,
        at_target: apoBCurrent <= apoBTarget,
        estimated: false,
      } : { current: null, target: apoBTarget, at_target: null, estimated: false },
    },
  };
}

export default function NewAssessment() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const assessmentId = searchParams.get("id");

  const queryClient = useQueryClient();

  const [step, setStep] = useState("screening"); // screening | results

  const [screeningData, setScreeningData] = useState(null);

  const [assessment, setAssessment] = useState(null);

  // Carregar avaliação pelo Histórico (quando ?id=...)
  const { data: loadedAssessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: () => api.get(`/assessments/${assessmentId}`).then((res) => res.data),
    enabled: !!assessmentId,
  });

  useEffect(() => {
    if (!loadedAssessment) return;
    const sd = assessmentDataToScreeningData(loadedAssessment.assessment_data);
    setScreeningData(sd);
    setAssessment(buildAssessmentFromApi(loadedAssessment));
    setStep("results");
  }, [loadedAssessment]);

  const handleScreeningComplete = (data) => {

    setScreeningData(data);

    

    // Processar dados através do motor de regras

    const engine = new RiskEngine();

    

    // Organizar dados para o motor

    const processedData = {

      patient: {

        sex: data.sex,

        age: data.age,

        weight: data.weight,

        height: data.height,

        waist_circumference: data.waist_circumference,

        menopause_status: data.menopause_status,

      },

      lipids: {

        total_cholesterol: data.total_cholesterol,

        ldl_c: data.ldl_c,

        hdl_c: data.hdl_c,

        triglycerides: data.triglycerides,

        apo_b: data.apo_b,

        has_lp_a: data.has_lp_a,

        lp_a_value: data.lp_a_value,

        lp_a_unit: data.lp_a_unit,

        fasting: data.fasting,

      },

      clinical: {

        has_diabetes: data.has_diabetes,

        diabetes_duration_years: data.diabetes_duration,

        diabetes_complications: data.diabetes_complications,

        has_hypertension: data.has_hypertension,

        systolic_bp: data.systolic_bp,

        hypertension_treated: data.hypertension_treated,

        is_current_smoker: data.is_current_smoker,

        is_former_smoker: data.is_former_smoker,

        years_since_quit_smoking: data.years_since_quit,

        has_ckd: data.has_ckd,

        ckd_stage: data.ckd_stage,

        has_combined_familial_hyperlipidemia: data.has_combined_familial_hyperlipidemia,

        lipid_therapy_response: data.lipid_therapy_response,

        tg_reduction_percentage: data.tg_reduction_percentage,

        has_pancreatitis_history: data.has_pancreatitis_history,

        recurrent_abdominal_pain: data.recurrent_abdominal_pain,

        symptom_onset_age: data.symptom_onset_age,

        tg_previous_measurements: data.tg_previous_measurements,

        tg_highest_value: data.tg_highest_value,

        tg_previous_low: data.tg_previous_low,

        has_secondary_factors: data.has_secondary_factors,

      },

      atherosclerotic: {

        has_ascvd: data.has_ascvd,

        ascvd_events: data.ascvd_type,

        myocardial_infarction: data.ascvd_type?.includes("mi"),

        ischemic_stroke: data.ascvd_type?.includes("stroke"),

        unstable_angina: data.ascvd_type?.includes("unstable_angina"),

        revascularization: data.ascvd_type?.includes("revascularization"),

        peripheral_artery_disease: data.ascvd_type?.includes("pad"),

        carotid_stenosis: data.ascvd_type?.includes("carotid_stenosis"),

        aortic_aneurysm: data.ascvd_type?.includes("aortic_aneurysm"),

        recurrent_events: data.recurrent_events,

        multivessel_disease: data.multivessel_disease,

      },

      familyHistory: {

        has_family_history_cad: data.has_family_history_cad,

        affected_relatives: data.affected_relatives,

        family_ldl_very_high: data.family_ldl_very_high,

        suspected_familial_hypercholesterolemia: data.suspected_fh,

      },

      imaging: {

        has_cac: data.has_cac,

        cac_score: data.cac_score,

        has_carotid_us: data.has_carotid_us,

        carotid_plaque: data.carotid_plaque,

        carotid_imt_elevated: data.carotid_imt_elevated,

      },

    };

    const result = engine.generateFullAssessment(processedData);

    setAssessment(result);

    setStep("results");

    // Salvar automaticamente ao chegar no final (Histórico e Avaliações Recentes)
    saveAssessmentMutation.mutate({ screeningData: data, assessment: result });

  };

  const saveAssessmentMutation = useMutation({

    mutationFn: async (payload) => {

      const sd = payload?.screeningData ?? screeningData;

      const a = payload?.assessment ?? assessment;

      if (!sd || !a) return null;

      // Salvar paciente (simplificado - em produção seria mais robusto)

      const patient = await savePatient({

        name: sd.patient_name || "Paciente",

        sex: sd.sex,

        birth_date: null,

        weight: sd.weight,

        height: sd.height,

        waist_circumference: sd.waist_circumference,

        menopause_status: sd.menopause_status,

      });

      // Salvar perfil lipídico

      await saveLipidPanel({

        patient_id: patient.id,

        exam_date: new Date().toISOString().split("T")[0],

        fasting: sd.fasting,

        total_cholesterol: sd.total_cholesterol,

        ldl_c: sd.ldl_c,

        hdl_c: sd.hdl_c,

        triglycerides: sd.triglycerides,

        non_hdl_c: a.derived_values?.non_hdl_c,

        apo_b: sd.apo_b,

        lp_a: sd.lp_a_value,

        lp_a_unit: sd.lp_a_unit,

      });

      // Salvar avaliação de risco completa
      const fullAssessmentData = {
        assessment_data: {
          patient_name: sd.patient_name ?? null,
          patient: {
            age: sd.age,
            sex: sd.sex,
            menopause_status: sd.menopause_status,
            weight: sd.weight,
            height: sd.height,
            waist_circumference: sd.waist_circumference,
          },
          lipids: {
            fasting: sd.fasting,
            total_cholesterol: sd.total_cholesterol,
            ldl_c: sd.ldl_c,
            hdl_c: sd.hdl_c,
            triglycerides: sd.triglycerides,
            non_hdl_c: a.derived_values?.non_hdl_c,
            apo_b: sd.apo_b,
            has_lp_a: sd.has_lp_a,
            lp_a_value: sd.lp_a_value,
            lp_a_unit: sd.lp_a_unit,
          },
          clinical: {
            has_diabetes: sd.has_diabetes,
            diabetes_duration: sd.diabetes_duration,
            diabetes_complications: sd.diabetes_complications,
            has_hypertension: sd.has_hypertension,
            systolic_bp: sd.systolic_bp,
            hypertension_treated: sd.hypertension_treated,
            is_current_smoker: sd.is_current_smoker,
            is_former_smoker: sd.is_former_smoker,
            has_ckd: sd.has_ckd,
            ckd_stage: sd.ckd_stage,
            has_ascvd: sd.has_ascvd,
            ascvd_type: sd.ascvd_type,
            recurrent_events: sd.recurrent_events,
            multivessel_disease: sd.multivessel_disease,
            has_pancreatitis_history: sd.has_pancreatitis_history,
            recurrent_abdominal_pain: sd.recurrent_abdominal_pain,
            symptom_onset_age: sd.symptom_onset_age,
            tg_previous_measurements: sd.tg_previous_measurements,
            tg_highest_value: sd.tg_highest_value,
            tg_previous_low: sd.tg_previous_low,
            has_secondary_factors: sd.has_secondary_factors,
            has_combined_familial_hyperlipidemia: sd.has_combined_familial_hyperlipidemia,
            lipid_therapy_response: sd.lipid_therapy_response,
            tg_reduction_percentage: sd.tg_reduction_percentage,
          },
          imaging: {
            has_cac: sd.has_cac,
            cac_score: sd.cac_score,
            has_carotid_us: sd.has_carotid_us,
            carotid_plaque: sd.carotid_plaque,
            carotid_stenosis_percent: sd.carotid_stenosis_percent,
            carotid_imt_elevated: sd.carotid_imt_elevated,
            has_abdominal_aneurysm: sd.has_abdominal_aneurysm,
          },
          familyHistory: {
            has_family_history_cad: sd.has_family_history_cad,
            affected_relatives: sd.affected_relatives,
            family_ldl_very_high: sd.family_ldl_very_high,
            suspected_fh: sd.suspected_fh,
          },
        },
        risk_classification: a.risk_classification,
      };

      const savedAssessment = await saveRiskAssessment(fullAssessmentData);

      return savedAssessment;

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["assessments"] });

      queryClient.invalidateQueries({ queryKey: ["recentAssessments"] });

      // Permanece na tela de resultado (não redireciona para Histórico)

    },

  });

  const handlePrint = () => {

    window.print();

  };

  const handleReset = () => {

    setStep("screening");

    setScreeningData(null);

    setAssessment(null);

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-4">

            <Button

              variant="ghost"

              size="icon"

              onClick={() => navigate(createPageUrl("Home"))}

              className="rounded-full"

            >

              <ArrowLeft className="w-5 h-5" />

            </Button>

            <div>

              <h1 className="text-2xl font-bold text-gray-900">

                {step === "screening" ? "Nova Avaliação" : "Resultado da Avaliação"}

              </h1>

              <p className="text-sm text-gray-500">

                Diretriz SBC 2025 - Dislipidemias e Prevenção da Aterosclerose

              </p>

            </div>

          </div>

          {step === "results" && (

            <Button variant="outline" onClick={handleReset} className="gap-2">

              <RotateCcw className="w-4 h-4" />

              Nova Avaliação

            </Button>

          )}

        </div>

        {/* Content */}

        {assessmentId && (isLoadingAssessment || (loadedAssessment && !screeningData)) ? (

          <Card className="p-8 text-center">

            <p className="text-gray-500">Carregando avaliação...</p>

          </Card>

        ) : step === "screening" ? (

          <AdaptiveScreening

            onComplete={handleScreeningComplete}

            initialData={screeningData || {}}

          />

        ) : (

          <div className="space-y-6">

            {/* Resultados */}

            <RiskResultCard assessment={assessment} />

            {/* Dados Faltantes */}

            <MissingDataCard missingData={assessment?.missing_data} />

            {/* Resumo */}

            <AssessmentSummary 

              assessment={assessment} 

              patientData={screeningData}

              onPrint={handlePrint}

            />

            {/* Actions */}

            <div className="flex justify-end gap-3 pt-4">

              <Button

                variant="outline"

                onClick={() => setStep("screening")}

                className="gap-2"

              >

                <ArrowLeft className="w-4 h-4" />

                Voltar às perguntas

              </Button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}
