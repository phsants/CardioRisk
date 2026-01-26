import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { SCREENING_QUESTIONS, LIPID_REFERENCE_VALUES } from "../guidelines/GuidelineData";

const SECTIONS = [
  { id: "demographics", title: "Dados Demográficos", icon: "👤" },
  { id: "anthropometry", title: "Antropometria", icon: "📏" },
  { id: "lipid_panel", title: "Perfil Lipídico", icon: "🧪" },
  { id: "clinical_history", title: "História Clínica", icon: "📋" },
  { id: "atherosclerotic_disease", title: "Doença Aterosclerótica", icon: "❤️" },
  { id: "imaging_markers", title: "Exames de Imagem", icon: "🔬" },
  { id: "family_history", title: "História Familiar", icon: "👨‍👩‍👧‍👦" },
];

export default function AdaptiveScreening({ onComplete, initialData = {} }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState(initialData);
  const [alerts, setAlerts] = useState([]);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Filtra perguntas baseado em condições
  const getVisibleQuestions = (sectionId) => {
    const questions = SCREENING_QUESTIONS[sectionId] || [];
    return questions.filter((q) => {
      if (!q.condition) return true;
      const conditionValue = answers[q.condition.field];
      return conditionValue === q.condition.value;
    });
  };

  // Verifica se todas as perguntas obrigatórias foram respondidas
  const isSectionComplete = (sectionId) => {
    const questions = getVisibleQuestions(sectionId);
    return questions.every((q) => {
      if (!q.required) return true;
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== "";
    });
  };

  // Atualiza resposta e verifica alertas
  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Verifica alertas específicos
    const question = Object.values(SCREENING_QUESTIONS)
      .flat()
      .find((q) => q.id === questionId);

    if (question?.alert) {
      const { condition, message } = question.alert;
      let shouldAlert = false;
      
      if (condition.operator === ">=") shouldAlert = value >= condition.value;
      if (condition.operator === ">") shouldAlert = value > condition.value;
      if (condition.operator === "<=") shouldAlert = value <= condition.value;
      if (condition.operator === "<") shouldAlert = value < condition.value;

      if (shouldAlert) {
        setAlerts((prev) => [
          ...prev.filter((a) => a.questionId !== questionId),
          { questionId, message, type: "warning" },
        ]);
      } else {
        setAlerts((prev) => prev.filter((a) => a.questionId !== questionId));
      }
    }

    // Alertas automáticos baseados em valores lipídicos
    checkLipidAlerts(questionId, value);
  };

  const checkLipidAlerts = (questionId, value) => {
    const lipidAlerts = [];

    if (questionId === "ldl_c" && value >= 190) {
      lipidAlerts.push({
        questionId,
        message: "LDL-c muito elevado. Considerar investigação de Hipercolesterolemia Familiar.",
        type: "warning",
      });
    }

    if (questionId === "triglycerides") {
      if (value >= 500) {
        lipidAlerts.push({
          questionId,
          message: "TG ≥ 500 mg/dL - Risco de pancreatite! Verificar jejum e investigar causas secundárias.",
          type: "critical",
        });
      } else if (value >= 400) {
        lipidAlerts.push({
          questionId,
          message: "TG muito elevado. Confirmar jejum de 12h. Investigar diabetes, hipotireoidismo, álcool.",
          type: "warning",
        });
      }
    }

    if (questionId === "hdl_c") {
      const sex = answers.sex;
      const threshold = sex === "masculino" ? 40 : 50;
      if (value < threshold) {
        lipidAlerts.push({
          questionId,
          message: `HDL-c baixo (< ${threshold} mg/dL para ${sex}). Fator de risco adicional.`,
          type: "info",
        });
      }
    }

    if (lipidAlerts.length > 0) {
      setAlerts((prev) => [
        ...prev.filter((a) => a.questionId !== questionId),
        ...lipidAlerts,
      ]);
    }
  };

  // Lógica adaptativa para pular seções
  const shouldSkipSection = (sectionId) => {
    // Se já teve evento CV, pode pular certas perguntas de risco
    if (answers.has_ascvd === true) {
      if (sectionId === "imaging_markers") {
        return {
          skip: false,
          reason: "Exames de imagem podem fornecer informações adicionais mesmo com DASC estabelecida",
        };
      }
    }
    return { skip: false };
  };

  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      let nextSection = currentSection + 1;
      
      // Pula seções se necessário
      while (nextSection < SECTIONS.length) {
        const skipInfo = shouldSkipSection(SECTIONS[nextSection].id);
        if (!skipInfo.skip) break;
        nextSection++;
      }
      
      setCurrentSection(nextSection);
    } else {
      // Finaliza triagem
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderQuestion = (question) => {
    const value = answers[question.id];

    switch (question.type) {
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={question.id}
                type="number"
                value={value || ""}
                onChange={(e) => handleAnswer(question.id, parseFloat(e.target.value) || null)}
                className="max-w-xs"
                placeholder={question.unit ? `Em ${question.unit}` : ""}
              />
              {question.unit && (
                <span className="text-sm text-gray-500">{question.unit}</span>
              )}
            </div>
            {question.description && (
              <p className="text-xs text-gray-500">{question.description}</p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-500 -mt-1">{question.description}</p>
            )}
            <RadioGroup
              value={value === true ? "yes" : value === false ? "no" : undefined}
              onValueChange={(v) => handleAnswer(question.id, v === "yes")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "select":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value || undefined}
              onValueChange={(v) => handleAnswer(question.id, v)}
              className="grid gap-2"
            >
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    value === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "multiselect":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid gap-2">
              {question.options.map((option) => {
                const selected = Array.isArray(value) && value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      const current = Array.isArray(value) ? value : [];
                      if (selected) {
                        handleAnswer(question.id, current.filter((v) => v !== option.value));
                      } else {
                        // Se selecionou "none", remove outros. Se selecionou outro, remove "none"
                        if (option.value === "none") {
                          handleAnswer(question.id, ["none"]);
                        } else {
                          handleAnswer(question.id, [...current.filter((v) => v !== "none"), option.value]);
                        }
                      }
                    }}
                  >
                    <Checkbox checked={selected} />
                    <span className="flex-1">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentSectionData = SECTIONS[currentSection];
  const visibleQuestions = getVisibleQuestions(currentSectionData.id);
  const sectionComplete = isSectionComplete(currentSectionData.id);
  const progress = ((currentSection + 1) / SECTIONS.length) * 100;

  // Alertas da seção atual
  const currentAlerts = alerts.filter((a) =>
    visibleQuestions.some((q) => q.id === a.questionId)
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Etapa {currentSection + 1} de {SECTIONS.length}</span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Section Navigation Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {SECTIONS.map((section, index) => (
          <Button
            key={section.id}
            variant={index === currentSection ? "default" : "outline"}
            size="sm"
            className={`whitespace-nowrap ${
              index === currentSection 
                ? "bg-blue-600 text-white" 
                : isSectionComplete(section.id) 
                  ? "border-green-500 text-green-700" 
                  : ""
            }`}
            onClick={() => setCurrentSection(index)}
          >
            <span className="mr-1">{section.icon}</span>
            {section.title}
            {isSectionComplete(section.id) && index !== currentSection && (
              <CheckCircle2 className="w-3 h-3 ml-1 text-green-500" />
            )}
          </Button>
        ))}
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-2xl">{currentSectionData.icon}</span>
                {currentSectionData.title}
              </CardTitle>
              <CardDescription>
                Preencha as informações abaixo. Campos com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Alerts */}
              {currentAlerts.length > 0 && (
                <div className="space-y-2">
                  {currentAlerts.map((alert, index) => (
                    <Alert
                      key={index}
                      variant={alert.type === "critical" ? "destructive" : "default"}
                      className={
                        alert.type === "warning"
                          ? "border-yellow-500 bg-yellow-50"
                          : alert.type === "info"
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }
                    >
                      {alert.type === "critical" || alert.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {visibleQuestions.map((question) => (
                  <div key={question.id}>{renderQuestion(question)}</div>
                ))}
              </div>

              {visibleQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Não há perguntas adicionais para esta seção com base nas respostas anteriores.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentSection === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="flex gap-2">
          {currentSection < SECTIONS.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentSection(currentSection + 1)}
              className="text-gray-500"
            >
              Pular seção
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {currentSection === SECTIONS.length - 1 ? (
              <>
                Finalizar Avaliação
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Summary */}
      {Object.keys(answers).length > 0 && (
        <Card className="mt-6 bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Resumo Parcial
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-2">
              {answers.sex && (
                <Badge variant="outline">
                  {answers.sex === "masculino" ? "♂ Masculino" : "♀ Feminino"}
                </Badge>
              )}
              {answers.age && (
                <Badge variant="outline">{answers.age} anos</Badge>
              )}
              {answers.ldl_c && (
                <Badge variant={answers.ldl_c >= 190 ? "destructive" : "outline"}>
                  LDL: {answers.ldl_c} mg/dL
                </Badge>
              )}
              {answers.has_diabetes === true && (
                <Badge className="bg-amber-100 text-amber-800">DM</Badge>
              )}
              {answers.has_hypertension === true && (
                <Badge className="bg-red-100 text-red-800">HAS</Badge>
              )}
              {answers.has_ascvd === true && (
                <Badge className="bg-red-500 text-white">DASC</Badge>
              )}
              {answers.is_current_smoker === true && (
                <Badge className="bg-gray-700 text-white">Tabagista</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
