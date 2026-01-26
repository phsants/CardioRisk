import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPageUrl } from "@/utils";

import AdaptiveScreening from "@/components/screening/AdaptiveScreening";

import RiskResultCard from "@/components/results/RiskResultCard";

import MissingDataCard from "@/components/results/MissingDataCard";

import AssessmentSummary from "@/components/results/AssessmentSummary";

import RiskEngine from "@/components/guidelines/RiskEngine";

import { 

  ArrowLeft, 

  ClipboardList, 

  Save, 

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

export default function NewAssessment() {

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [step, setStep] = useState("screening"); // screening | results

  const [screeningData, setScreeningData] = useState(null);

  const [assessment, setAssessment] = useState(null);

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

        is_current_smoker: data.is_current_smoker,

        is_former_smoker: data.is_former_smoker,

        years_since_quit_smoking: data.years_since_quit,

        has_ckd: data.has_ckd,

        ckd_stage: data.ckd_stage,

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

  };

  const saveAssessmentMutation = useMutation({

    mutationFn: async () => {

      // Salvar paciente (simplificado - em produção seria mais robusto)

      const patient = await savePatient({

        name: screeningData.patient_name || "Paciente",

        sex: screeningData.sex,

        birth_date: null,

        weight: screeningData.weight,

        height: screeningData.height,

        waist_circumference: screeningData.waist_circumference,

        menopause_status: screeningData.menopause_status,

      });

      // Salvar perfil lipídico

      await saveLipidPanel({

        patient_id: patient.id,

        exam_date: new Date().toISOString().split("T")[0],

        fasting: screeningData.fasting,

        total_cholesterol: screeningData.total_cholesterol,

        ldl_c: screeningData.ldl_c,

        hdl_c: screeningData.hdl_c,

        triglycerides: screeningData.triglycerides,

        non_hdl_c: assessment.derived_values?.non_hdl_c,

        apo_b: screeningData.apo_b,

        lp_a: screeningData.lp_a_value,

        lp_a_unit: screeningData.lp_a_unit,

      });

      // Salvar avaliação de risco completa
      const fullAssessmentData = {
        assessment_data: {
          patient: {
            age: screeningData.age,
            sex: screeningData.sex,
            menopause_status: screeningData.menopause_status,
            weight: screeningData.weight,
            height: screeningData.height,
            waist_circumference: screeningData.waist_circumference,
          },
          lipids: {
            fasting: screeningData.fasting,
            total_cholesterol: screeningData.total_cholesterol,
            ldl_c: screeningData.ldl_c,
            hdl_c: screeningData.hdl_c,
            triglycerides: screeningData.triglycerides,
            non_hdl_c: assessment.derived_values?.non_hdl_c,
            apo_b: screeningData.apo_b,
            has_lp_a: screeningData.has_lp_a,
            lp_a_value: screeningData.lp_a_value,
            lp_a_unit: screeningData.lp_a_unit,
          },
          clinical: {
            has_diabetes: screeningData.has_diabetes,
            diabetes_duration: screeningData.diabetes_duration,
            diabetes_complications: screeningData.diabetes_complications,
            has_hypertension: screeningData.has_hypertension,
            is_current_smoker: screeningData.is_current_smoker,
            is_former_smoker: screeningData.is_former_smoker,
            has_ckd: screeningData.has_ckd,
            ckd_stage: screeningData.ckd_stage,
            has_ascvd: screeningData.has_ascvd,
            ascvd_type: screeningData.ascvd_type,
            recurrent_events: screeningData.recurrent_events,
            multivessel_disease: screeningData.multivessel_disease,
            has_pancreatitis_history: screeningData.has_pancreatitis_history,
            recurrent_abdominal_pain: screeningData.recurrent_abdominal_pain,
            symptom_onset_age: screeningData.symptom_onset_age,
            tg_previous_measurements: screeningData.tg_previous_measurements,
            tg_highest_value: screeningData.tg_highest_value,
            tg_previous_low: screeningData.tg_previous_low,
            has_secondary_factors: screeningData.has_secondary_factors,
            has_combined_familial_hyperlipidemia: screeningData.has_combined_familial_hyperlipidemia,
            lipid_therapy_response: screeningData.lipid_therapy_response,
            tg_reduction_percentage: screeningData.tg_reduction_percentage,
          },
          imaging: {
            has_cac: screeningData.has_cac,
            cac_score: screeningData.cac_score,
            has_carotid_us: screeningData.has_carotid_us,
            carotid_plaque: screeningData.carotid_plaque,
            carotid_stenosis_percent: screeningData.carotid_stenosis_percent,
            carotid_imt_elevated: screeningData.carotid_imt_elevated,
            has_abdominal_aneurysm: screeningData.has_abdominal_aneurysm,
          },
          familyHistory: {
            has_family_history_cad: screeningData.has_family_history_cad,
            affected_relatives: screeningData.affected_relatives,
            family_ldl_very_high: screeningData.family_ldl_very_high,
            suspected_fh: screeningData.suspected_fh,
          },
        },
        risk_classification: assessment.risk_classification,
      };

      const savedAssessment = await saveRiskAssessment(fullAssessmentData);

      return savedAssessment;

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["assessments"] });

      queryClient.invalidateQueries({ queryKey: ["recentAssessments"] });

      navigate(createPageUrl("History"));

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

        {step === "screening" ? (

          <AdaptiveScreening onComplete={handleScreeningComplete} />

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

                Editar Dados

              </Button>

              <Button

                onClick={() => saveAssessmentMutation.mutate()}

                disabled={saveAssessmentMutation.isPending}

                className="gap-2 bg-blue-600 hover:bg-blue-700"

              >

                <Save className="w-4 h-4" />

                {saveAssessmentMutation.isPending ? "Salvando..." : "Salvar Avaliação"}

              </Button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}
