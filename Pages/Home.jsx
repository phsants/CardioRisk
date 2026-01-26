import React from "react";

import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { createPageUrl } from "@/utils";

import { useQuery } from "@tanstack/react-query";

import { 

  Heart, 

  FilePlus, 

  History, 

  BookOpen, 

  Target,

  TrendingUp,

  AlertTriangle,

  ArrowRight,

  Stethoscope,

  Activity,

  ChevronRight

} from "lucide-react";

import { format } from "date-fns";

import { ptBR } from "date-fns/locale";

import { RISK_CATEGORIES } from "@/components/guidelines/GuidelineData";

// Função para buscar avaliações recentes - substituir pela sua implementação
const fetchRecentAssessments = async () => {
  // TODO: Implementar busca de avaliações recentes do backend
  // Exemplo: const response = await fetch('/api/assessments/recent?limit=5');
  // return response.json();
  return [];
};

export default function Home() {

  const { data: recentAssessments = [], isLoading } = useQuery({

    queryKey: ["recentAssessments"],

    queryFn: fetchRecentAssessments,

  });

  const getRiskColor = (category) => {

    return RISK_CATEGORIES[category]?.color || "#6B7280";

  };

  const getRiskName = (category) => {

    return RISK_CATEGORIES[category]?.name || category;

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="text-center mb-12">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">

            <Heart className="w-10 h-10 text-white" />

          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">

            Avaliador de Risco Cardiovascular

          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">

            Estratificação de risco e metas lipídicas baseadas na 

            <span className="font-semibold text-blue-600"> Diretriz Brasileira de Dislipidemias - SBC 2025</span>

          </p>

        </div>



        {/* Quick Actions */}

        <div className="grid md:grid-cols-3 gap-6 mb-12">

          <Link to={createPageUrl("NewAssessment")} className="group">

            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden">

              <CardContent className="p-6 relative">

                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />

                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />

                <div className="relative">

                  <div className="bg-white/20 rounded-full w-14 h-14 flex items-center justify-center mb-4">

                    <FilePlus className="w-7 h-7" />

                  </div>

                  <h3 className="text-xl font-bold mb-2">Nova Avaliação</h3>

                  <p className="text-blue-100 text-sm mb-4">

                    Inicie uma nova estratificação de risco cardiovascular

                  </p>

                  <div className="flex items-center text-sm font-medium group-hover:gap-2 transition-all">

                    Começar agora

                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />

                  </div>

                </div>

              </CardContent>

            </Card>

          </Link>



          <Link to={createPageUrl("History")} className="group">

            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0">

              <CardContent className="p-6">

                <div className="bg-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">

                  <History className="w-7 h-7 text-emerald-600" />

                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Histórico</h3>

                <p className="text-gray-600 text-sm mb-4">

                  Visualize avaliações anteriores e acompanhe a evolução

                </p>

                <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">

                  Ver histórico

                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />

                </div>

              </CardContent>

            </Card>

          </Link>



          <Link to={createPageUrl("Guidelines")} className="group">

            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0">

              <CardContent className="p-6">

                <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">

                  <BookOpen className="w-7 h-7 text-purple-600" />

                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Consultar Diretriz</h3>

                <p className="text-gray-600 text-sm mb-4">

                  Acesse os critérios e metas da Diretriz SBC 2025

                </p>

                <div className="flex items-center text-sm font-medium text-purple-600 group-hover:gap-2 transition-all">

                  Consultar

                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />

                </div>

              </CardContent>

            </Card>

          </Link>

        </div>



        {/* Risk Categories Overview */}

        <Card className="mb-8 border-0 shadow-lg">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <Target className="w-5 h-5 text-blue-600" />

              Categorias de Risco e Metas Lipídicas

            </CardTitle>

            <CardDescription>

              Resumo das metas de LDL-c conforme categoria de risco cardiovascular

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

              {Object.values(RISK_CATEGORIES).map((category) => (

                <div

                  key={category.id}

                  className="p-4 rounded-xl text-center transition-all hover:scale-105"

                  style={{ backgroundColor: `${category.color}15` }}

                >

                  <div

                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"

                    style={{ backgroundColor: category.color }}

                  >

                    <Heart className="w-4 h-4 text-white" />

                  </div>

                  <h4 

                    className="font-semibold text-sm mb-1"

                    style={{ color: category.color }}

                  >

                    {category.name}

                  </h4>

                  <div className="text-2xl font-bold text-gray-900">

                    ≤{category.ldl_target}

                  </div>

                  <div className="text-xs text-gray-500">mg/dL LDL-c</div>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>



        {/* Recent Assessments */}

        <Card className="border-0 shadow-lg">

          <CardHeader>

            <div className="flex items-center justify-between">

              <div>

                <CardTitle className="flex items-center gap-2">

                  <Activity className="w-5 h-5 text-blue-600" />

                  Avaliações Recentes

                </CardTitle>

                <CardDescription>

                  Últimas estratificações de risco realizadas

                </CardDescription>

              </div>

              {recentAssessments.length > 0 && (

                <Link to={createPageUrl("History")}>

                  <Button variant="outline" size="sm">

                    Ver todas

                  </Button>

                </Link>

              )}

            </div>

          </CardHeader>

          <CardContent>

            {isLoading ? (

              <div className="space-y-3">

                {[1, 2, 3].map((i) => (

                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />

                ))}

              </div>

            ) : recentAssessments.length === 0 ? (

              <div className="text-center py-12">

                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">

                  <Stethoscope className="w-8 h-8 text-gray-400" />

                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-1">

                  Nenhuma avaliação ainda

                </h3>

                <p className="text-gray-500 text-sm mb-4">

                  Comece criando sua primeira avaliação de risco cardiovascular

                </p>

                <Link to={createPageUrl("NewAssessment")}>

                  <Button className="bg-blue-600 hover:bg-blue-700">

                    <FilePlus className="w-4 h-4 mr-2" />

                    Nova Avaliação

                  </Button>

                </Link>

              </div>

            ) : (

              <div className="space-y-3">

                {recentAssessments.map((assessment) => (

                  <div

                    key={assessment.id}

                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"

                  >

                    <div className="flex items-center gap-4">

                      <div

                        className="w-10 h-10 rounded-full flex items-center justify-center"

                        style={{ backgroundColor: `${getRiskColor(assessment.risk_category)}20` }}

                      >

                        <Heart 

                          className="w-5 h-5"

                          style={{ color: getRiskColor(assessment.risk_category) }}

                        />

                      </div>

                      <div>

                        <div className="font-medium text-gray-900">

                          {getRiskName(assessment.risk_category)}

                        </div>

                        <div className="text-sm text-gray-500">

                          {format(new Date(assessment.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="text-right">

                        <div className="text-sm text-gray-500">LDL-c</div>

                        <div className="font-semibold">

                          {assessment.ldl_current} mg/dL

                        </div>

                      </div>

                      <Badge

                        variant={assessment.ldl_at_target ? "success" : "destructive"}

                        className={assessment.ldl_at_target 

                          ? "bg-green-100 text-green-700" 

                          : "bg-red-100 text-red-700"

                        }

                      >

                        {assessment.ldl_at_target ? "Na meta" : "Fora"}

                      </Badge>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </CardContent>

        </Card>



        {/* Footer */}

        <div className="text-center mt-12 text-sm text-gray-500">

          <p>Baseado na Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose</p>

          <p className="font-medium text-gray-700">Sociedade Brasileira de Cardiologia - 2025</p>

        </div>

      </div>

    </div>

  );

}
