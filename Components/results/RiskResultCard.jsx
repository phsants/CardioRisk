import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown,
  ArrowUpRight,
  Info,
  Target
} from "lucide-react";
import { RISK_CATEGORIES } from "../guidelines/GuidelineData";

const RISK_ORDER = ["low", "intermediate", "high", "very_high", "extreme"];

export default function RiskResultCard({ assessment }) {
  if (!assessment) return null;

  const { risk_classification, lipid_targets, alerts, derived_values } = assessment;

  const getRiskColor = (category) => {
    const colors = {
      low: "from-green-500 to-emerald-600",
      intermediate: "from-yellow-500 to-amber-600",
      high: "from-orange-500 to-orange-600",
      very_high: "from-red-500 to-red-600",
      extreme: "from-red-700 to-red-900",
    };
    return colors[category] || colors.low;
  };

  const getRiskBgColor = (category) => {
    const colors = {
      low: "bg-green-50 border-green-200",
      intermediate: "bg-yellow-50 border-yellow-200",
      high: "bg-orange-50 border-orange-200",
      very_high: "bg-red-50 border-red-200",
      extreme: "bg-red-100 border-red-300",
    };
    return colors[category] || colors.low;
  };

  const riskIndex = RISK_ORDER.indexOf(risk_classification.category);
  const riskProgress = ((riskIndex + 1) / RISK_ORDER.length) * 100;

  return (
    <div className="space-y-6">
      {/* Main Risk Card */}
      <Card className="overflow-hidden shadow-xl border-0">
        <div className={`bg-gradient-to-r ${getRiskColor(risk_classification.category)} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Categoria de Risco</p>
              <h2 className="text-3xl font-bold">{risk_classification.name}</h2>
              {risk_classification.upgraded && (
                <div className="flex items-center gap-1 mt-2 text-white/90 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  Elevado de {RISK_CATEGORIES[risk_classification.originalCategory]?.name}
                </div>
              )}
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <Heart className="w-8 h-8" />
            </div>
          </div>

          {/* Risk Scale */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/70 mb-2">
              <span>Baixo</span>
              <span>Intermediário</span>
              <span>Alto</span>
              <span>Muito Alto</span>
              <span>Extremo</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${riskProgress}%` }}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <p className="text-gray-600">{risk_classification.description}</p>

          {/* Criteria */}
          {risk_classification.criteria?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Critérios Identificados:
              </h4>
              <ul className="space-y-1">
                {risk_classification.criteria.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-500 mt-0.5">•</span>
                    {criterion.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modifiers */}
          {risk_classification.modifiers?.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Modificadores de Risco:
              </h4>
              <div className="flex flex-wrap gap-2">
                {risk_classification.modifiers.map((modifier, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {modifier.description}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lipid Targets Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Metas Lipídicas vs. Valores Atuais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {/* LDL-c */}
            <div className={`p-4 rounded-lg border ${lipid_targets.ldl_c.at_target ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">LDL-c</span>
                  {lipid_targets.ldl_c.at_target ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <Badge variant={lipid_targets.ldl_c.at_target ? "success" : "destructive"}>
                  {lipid_targets.ldl_c.at_target ? "Na meta" : "Fora da meta"}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Atual</span>
                  <p className="font-bold text-lg">{lipid_targets.ldl_c.current} mg/dL</p>
                </div>
                <div>
                  <span className="text-gray-500">Meta</span>
                  <p className="font-bold text-lg text-blue-600">≤ {lipid_targets.ldl_c.target} mg/dL</p>
                </div>
                {!lipid_targets.ldl_c.at_target && (
                  <div>
                    <span className="text-gray-500">Redução necessária</span>
                    <p className="font-bold text-lg text-red-600">
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      {lipid_targets.ldl_c.reduction_needed}%
                    </p>
                  </div>
                )}
              </div>
              {!lipid_targets.ldl_c.at_target && (
                <Progress 
                  value={(lipid_targets.ldl_c.target / lipid_targets.ldl_c.current) * 100} 
                  className="mt-3 h-2"
                />
              )}
            </div>

            {/* Não-HDL-c */}
            {lipid_targets.non_hdl_c.current && (
              <div className={`p-4 rounded-lg border ${lipid_targets.non_hdl_c.at_target ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Não-HDL-c</span>
                    {lipid_targets.non_hdl_c.at_target ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <Badge variant={lipid_targets.non_hdl_c.at_target ? "success" : "destructive"}>
                    {lipid_targets.non_hdl_c.at_target ? "Na meta" : "Fora da meta"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Atual</span>
                    <p className="font-bold text-lg">{Math.round(lipid_targets.non_hdl_c.current)} mg/dL</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Meta</span>
                    <p className="font-bold text-lg text-blue-600">≤ {lipid_targets.non_hdl_c.target} mg/dL</p>
                  </div>
                </div>
              </div>
            )}

            {/* ApoB */}
            {lipid_targets.apo_b.current && (
              <div className={`p-4 rounded-lg border ${lipid_targets.apo_b.at_target ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">ApoB</span>
                    {lipid_targets.apo_b.estimated && (
                      <Badge variant="outline" className="text-xs">Estimado</Badge>
                    )}
                    {lipid_targets.apo_b.at_target ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <Badge variant={lipid_targets.apo_b.at_target ? "success" : "secondary"}>
                    {lipid_targets.apo_b.at_target ? "Na meta" : "Acima da meta"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Atual {lipid_targets.apo_b.estimated && "(estimado)"}</span>
                    <p className="font-bold text-lg">{Math.round(lipid_targets.apo_b.current)} mg/dL</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Meta</span>
                    <p className="font-bold text-lg text-blue-600">≤ {lipid_targets.apo_b.target} mg/dL</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Derived Values */}
          {derived_values && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Valores Calculados:</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                {derived_values.bmi && (
                  <div>
                    <span className="text-gray-500">IMC: </span>
                    <span className="font-medium">{derived_values.bmi.toFixed(1)} kg/m²</span>
                  </div>
                )}
                {derived_values.metabolic_syndrome && (
                  <div>
                    <span className="text-gray-500">Síndrome Metabólica: </span>
                    <Badge variant={derived_values.metabolic_syndrome.present ? "destructive" : "secondary"}>
                      {derived_values.metabolic_syndrome.present 
                        ? `Sim (${derived_values.metabolic_syndrome.criteriaCount}/5 critérios)` 
                        : "Não"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts?.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert 
              key={index}
              variant={alert.type === "critical" ? "destructive" : "default"}
              className={
                alert.type === "warning" ? "border-yellow-500 bg-yellow-50" :
                alert.type === "suggestion" ? "border-blue-500 bg-blue-50" :
                alert.type === "info" ? "border-gray-300 bg-gray-50" : ""
              }
            >
              {alert.type === "critical" || alert.type === "warning" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle>
                {alert.type === "critical" ? "Alerta Crítico" : 
                 alert.type === "warning" ? "Atenção" :
                 alert.type === "suggestion" ? "Sugestão" : "Informação"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
