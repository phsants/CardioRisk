import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Printer, 
  Download, 
  Copy,
  Heart,
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RISK_CATEGORIES } from "../guidelines/GuidelineData";

export default function AssessmentSummary({ assessment, patientData, onPrint }) {
  if (!assessment) return null;

  const { risk_classification, lipid_targets, alerts, guideline_version } = assessment;

  const copyToClipboard = () => {
    const text = generateTextSummary();
    navigator.clipboard.writeText(text);
  };

  const generateTextSummary = () => {
    const dateStr = format(
      assessment.assessment_date ? new Date(assessment.assessment_date) : new Date(),
      "dd/MM/yyyy 'às' HH:mm",
      { locale: ptBR }
    );
    const patientName = patientData?.patient_name?.trim() || null;
    const criteria = risk_classification.criteria || [];
    const lt = lipid_targets || {};
    const ldl = lt.ldl_c || {};
    const nonHdl = lt.non_hdl_c || {};
    const apoB = lt.apo_b || {};
    const status = (at) => (at ? "Na meta" : "Fora da meta");
    const col1 = (s, w = 14) => String(s).padEnd(w);
    const col2 = (s, w = 14) => String(s).padEnd(w);
    const col3 = (s, w = 16) => String(s).padEnd(w);

    const lines = [
      "",
      "AVALIAÇÃO DE RISCO CARDIOVASCULAR",
      "Diretriz SBC 2025 - Dislipidemias e Prevenção da Aterosclerose",
      "",
      "Data da avaliação: " + dateStr,
      patientName ? "Paciente: " + patientName : null,
      "",
      "ESTRATIFICAÇÃO DE RISCO",
      "",
      "Categoria de risco: " + (risk_classification.name || "—"),
      risk_classification.description ? risk_classification.description : null,
      "",
      criteria.length > 0 ? "Critérios identificados:" : null,
      ...criteria.map((c, i) => (c?.description ? `  ${i + 1}. ${c.description}` : null)).filter(Boolean),
      "",
      "METAS LIPÍDICAS",
      "",
      col1("Parâmetro") + col2("Valor atual") + col3("Meta") + "Status",
      col1("LDL-c") + col2((ldl.current ?? "—") + " mg/dL") + col3("≤ " + (ldl.target ?? "—") + " mg/dL") + status(ldl.at_target),
    ];

    if (nonHdl.current != null && nonHdl.current !== undefined) {
      lines.push(col1("Não-HDL-c") + col2(Math.round(nonHdl.current) + " mg/dL") + col3("≤ " + (nonHdl.target ?? "—") + " mg/dL") + status(nonHdl.at_target));
    }
    if (apoB.current != null && apoB.current !== undefined) {
      lines.push(col1("ApoB") + col2(Math.round(apoB.current) + " mg/dL") + col3("≤ " + (apoB.target ?? "—") + " mg/dL") + status(apoB.at_target));
    }

    if (ldl.reduction_needed != null && !ldl.at_target) {
      lines.push("", "Redução de LDL-c necessária: " + ldl.reduction_needed + "%");
    }

    if (assessment.moulin_score?.score != null) {
      lines.push(
        "",
        "ESCORE DE MOULIN (SQF) - Quilomicronemia Familiar",
        "",
        "Escore total: " + assessment.moulin_score.score + " pontos",
        assessment.moulin_score.interpretationLabel ? "Interpretação: " + assessment.moulin_score.interpretationLabel : null,
        assessment.moulin_score.recommendation ? "Recomendação: " + assessment.moulin_score.recommendation : null
      );
    }

    if (alerts?.length > 0) {
      lines.push(
        "",
        "ALERTAS",
        "",
        ...alerts.map((a) => (a?.message ? "• " + a.message : null)).filter(Boolean)
      );
    }

    lines.push(
      "",
      "Referência: " + (guideline_version || "Diretriz SBC 2025") + " - Sociedade Brasileira de Cardiologia",
      ""
    );

    return lines.filter((line) => line !== null && line !== undefined).join("\n");
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Resumo da Avaliação
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {format(assessment.assessment_date ? new Date(assessment.assessment_date) : new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
          </div>
          <Badge variant="outline" className="text-xs">
            {guideline_version}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Risk Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <Heart className="w-4 h-4" />
              CATEGORIA DE RISCO
            </h4>
            <div 
              className="text-xl font-bold p-3 rounded-lg"
              style={{ 
                backgroundColor: `${risk_classification.color}20`,
                color: risk_classification.color 
              }}
            >
              {risk_classification.name}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <Target className="w-4 h-4" />
              METAS PRINCIPAIS
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">LDL-c</span>
                <span className="font-semibold">≤ {risk_classification.ldl_target} mg/dL</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Não-HDL-c</span>
                <span className="font-semibold">≤ {risk_classification.non_hdl_target} mg/dL</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Status dos Lipídeos */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-3">STATUS ATUAL DOS LIPÍDEOS</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg border ${lipid_targets.ldl_c.at_target ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-1 mb-1">
                {lipid_targets.ldl_c.at_target ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs font-medium">LDL-c</span>
              </div>
              <div className="text-lg font-bold">{lipid_targets.ldl_c.current}</div>
              <div className="text-xs text-gray-500">Meta: ≤ {lipid_targets.ldl_c.target}</div>
            </div>

            {lipid_targets.non_hdl_c.current && (
              <div className={`p-3 rounded-lg border ${lipid_targets.non_hdl_c.at_target ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-1 mb-1">
                  {lipid_targets.non_hdl_c.at_target ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs font-medium">Não-HDL-c</span>
                </div>
                <div className="text-lg font-bold">{Math.round(lipid_targets.non_hdl_c.current)}</div>
                <div className="text-xs text-gray-500">Meta: ≤ {lipid_targets.non_hdl_c.target}</div>
              </div>
            )}

            {lipid_targets.apo_b.current && (
              <div className={`p-3 rounded-lg border ${lipid_targets.apo_b.at_target ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-1 mb-1">
                  {lipid_targets.apo_b.at_target ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-xs font-medium">ApoB</span>
                </div>
                <div className="text-lg font-bold">{Math.round(lipid_targets.apo_b.current)}</div>
                <div className="text-xs text-gray-500">
                  Meta: ≤ {lipid_targets.apo_b.target}
                  {lipid_targets.apo_b.estimated && " (est.)"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Justificativa */}
        {risk_classification.criteria?.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2">JUSTIFICATIVA DA CLASSIFICAÇÃO</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                {risk_classification.criteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    {c.description}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
