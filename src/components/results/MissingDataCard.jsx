import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lightbulb } from "lucide-react";

export default function MissingDataCard({ missingData }) {
  if (!missingData || missingData.length === 0) return null;

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
          <Lightbulb className="w-5 h-5" />
          Dados Sugeridos para Avaliação Mais Completa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {missingData.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
