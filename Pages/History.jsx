import React, { useState } from "react";

import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createPageUrl } from "@/utils";

import { useQuery } from "@tanstack/react-query";

import { 

  Heart, 

  Search, 

  Filter,

  ArrowLeft,

  ChevronRight,

  Calendar,

  Target,

  AlertTriangle,

  CheckCircle2,

  FileText

} from "lucide-react";

import { format } from "date-fns";

import { ptBR } from "date-fns/locale";

import { RISK_CATEGORIES } from "@/components/guidelines/GuidelineData";

import { api } from "@/services/api";

// Função para buscar avaliações
const fetchAssessments = async () => {
  try {
    const response = await api.get('/assessments');
    return response.data.map(assessment => ({
      id: assessment.id,
      patient_name: assessment.assessment_data?.patient_name ?? assessment.assessment_data?.patient?.patient_name ?? null,
      risk_category: assessment.risk_category,
      ldl_current: assessment.ldl_current,
      ldl_target: assessment.ldl_target,
      ldl_at_target: assessment.ldl_at_target,
      ldl_reduction_needed: assessment.ldl_current && assessment.ldl_target
        ? Math.round(((assessment.ldl_current - assessment.ldl_target) / assessment.ldl_current) * 100)
        : 0,
      created_date: assessment.created_at,
      risk_category_justification: assessment.assessment_data?.risk_classification?.criteria?.[0]?.description || '',
      alerts: assessment.assessment_data?.alerts || [],
    }));
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return [];
  }
};

export default function History() {

  const [filterCategory, setFilterCategory] = useState("all");

  const [filterStatus, setFilterStatus] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

  const { data: assessments = [], isLoading } = useQuery({

    queryKey: ["assessments"],

    queryFn: fetchAssessments,

  });

  const getRiskColor = (category) => {

    return RISK_CATEGORIES[category]?.color || "#6B7280";

  };

  const getRiskName = (category) => {

    return RISK_CATEGORIES[category]?.name || category;

  };

  const filteredAssessments = assessments.filter((a) => {

    if (filterCategory !== "all" && a.risk_category !== filterCategory) return false;

    if (filterStatus === "at_target" && !a.ldl_at_target) return false;

    if (filterStatus === "not_at_target" && a.ldl_at_target) return false;

    return true;

  });

  // Statistics

  const stats = {

    total: assessments.length,

    atTarget: assessments.filter((a) => a.ldl_at_target).length,

    notAtTarget: assessments.filter((a) => !a.ldl_at_target).length,

    byCategory: Object.keys(RISK_CATEGORIES).reduce((acc, cat) => {

      acc[cat] = assessments.filter((a) => a.risk_category === cat).length;

      return acc;

    }, {}),

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="flex items-center gap-4 mb-8">

          <Link to={createPageUrl("Home")}>

            <Button variant="ghost" size="icon" className="rounded-full">

              <ArrowLeft className="w-5 h-5" />

            </Button>

          </Link>

          <div>

            <h1 className="text-2xl font-bold text-gray-900">Histórico de Avaliações</h1>

            <p className="text-sm text-gray-500">

              Acompanhe todas as estratificações de risco realizadas

            </p>

          </div>

        </div>

        {/* Stats Cards */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <Card className="border-0 shadow-md">

            <CardContent className="p-4">

              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>

              <div className="text-sm text-gray-500">Total de Avaliações</div>

            </CardContent>

          </Card>

          <Card className="border-0 shadow-md bg-green-50">

            <CardContent className="p-4">

              <div className="text-3xl font-bold text-green-600">{stats.atTarget}</div>

              <div className="text-sm text-green-700">Na Meta</div>

            </CardContent>

          </Card>

          <Card className="border-0 shadow-md bg-red-50">

            <CardContent className="p-4">

              <div className="text-3xl font-bold text-red-600">{stats.notAtTarget}</div>

              <div className="text-sm text-red-700">Fora da Meta</div>

            </CardContent>

          </Card>

          <Card className="border-0 shadow-md bg-blue-50">

            <CardContent className="p-4">

              <div className="text-3xl font-bold text-blue-600">

                {stats.total > 0 ? Math.round((stats.atTarget / stats.total) * 100) : 0}%

              </div>

              <div className="text-sm text-blue-700">Taxa de Sucesso</div>

            </CardContent>

          </Card>

        </div>

        {/* Filters */}

        <Card className="border-0 shadow-md mb-6">

          <CardContent className="p-4">

            <div className="flex flex-wrap gap-4">

              <div className="flex-1 min-w-[200px]">

                <div className="relative">

                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <Input

                    placeholder="Buscar..."

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    className="pl-10"

                  />

                </div>

              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>

                <SelectTrigger className="w-[180px]">

                  <Filter className="w-4 h-4 mr-2" />

                  <SelectValue placeholder="Categoria" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">Todas categorias</SelectItem>

                  {Object.values(RISK_CATEGORIES).map((cat) => (

                    <SelectItem key={cat.id} value={cat.id}>

                      {cat.name}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>

                <SelectTrigger className="w-[180px]">

                  <Target className="w-4 h-4 mr-2" />

                  <SelectValue placeholder="Status" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">Todos status</SelectItem>

                  <SelectItem value="at_target">Na meta</SelectItem>

                  <SelectItem value="not_at_target">Fora da meta</SelectItem>

                </SelectContent>

              </Select>

            </div>

          </CardContent>

        </Card>

        {/* Distribution by Category */}

        <Card className="border-0 shadow-md mb-6">

          <CardHeader className="pb-2">

            <CardTitle className="text-base">Distribuição por Categoria de Risco</CardTitle>

          </CardHeader>

          <CardContent>

            <div className="flex gap-2 flex-wrap">

              {Object.values(RISK_CATEGORIES).map((cat) => (

                <div

                  key={cat.id}

                  className="flex items-center gap-2 px-3 py-2 rounded-lg"

                  style={{ backgroundColor: `${cat.color}15` }}

                >

                  <div

                    className="w-3 h-3 rounded-full"

                    style={{ backgroundColor: cat.color }}

                  />

                  <span className="text-sm font-medium">{cat.name}</span>

                  <Badge variant="secondary" className="text-xs">

                    {stats.byCategory[cat.id] || 0}

                  </Badge>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>

        {/* Assessments List */}

        <Card className="border-0 shadow-lg">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <FileText className="w-5 h-5 text-blue-600" />

              Avaliações

            </CardTitle>

            <CardDescription>

              {filteredAssessments.length} avaliações encontradas

            </CardDescription>

          </CardHeader>

          <CardContent>

            {isLoading ? (

              <div className="space-y-3">

                {[1, 2, 3, 4, 5].map((i) => (

                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />

                ))}

              </div>

            ) : filteredAssessments.length === 0 ? (

              <div className="text-center py-12">

                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">

                  <Heart className="w-8 h-8 text-gray-400" />

                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-1">

                  Nenhuma avaliação encontrada

                </h3>

                <p className="text-gray-500 text-sm mb-4">

                  {filterCategory !== "all" || filterStatus !== "all"

                    ? "Tente ajustar os filtros"

                    : "Comece criando sua primeira avaliação"}

                </p>

                <Link to={createPageUrl("NewAssessment")}>

                  <Button className="bg-blue-600 hover:bg-blue-700">

                    Nova Avaliação

                  </Button>

                </Link>

              </div>

            ) : (

              <div className="space-y-3">

                {filteredAssessments.map((assessment) => (

                  <div

                    key={assessment.id}

                    className="border rounded-xl p-4 hover:shadow-md transition-all bg-white"

                  >

                    <div className="flex items-start justify-between">

                      <div className="flex items-start gap-4">

                        <div

                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"

                          style={{ backgroundColor: `${getRiskColor(assessment.risk_category)}20` }}

                        >

                          <Heart 

                            className="w-6 h-6"

                            style={{ color: getRiskColor(assessment.risk_category) }}

                          />

                        </div>

                        <div>

                          <div className="flex items-center gap-2 mb-1">

                            {assessment.patient_name && (

                              <span className="font-medium text-gray-900">

                                {assessment.patient_name}

                              </span>

                            )}

                            <span 

                              className="font-semibold"

                              style={{ color: getRiskColor(assessment.risk_category) }}

                            >

                              {getRiskName(assessment.risk_category)}

                            </span>

                            <Badge

                              className={assessment.ldl_at_target 

                                ? "bg-green-100 text-green-700 hover:bg-green-100" 

                                : "bg-red-100 text-red-700 hover:bg-red-100"

                              }

                            >

                              {assessment.ldl_at_target ? (

                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Na meta</>

                              ) : (

                                <><AlertTriangle className="w-3 h-3 mr-1" /> Fora</>

                              )}

                            </Badge>

                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">

                            <span className="flex items-center gap-1">

                              <Calendar className="w-4 h-4" />

                              {format(new Date(assessment.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}

                            </span>

                          </div>

                          {assessment.risk_category_justification && (

                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">

                              {assessment.risk_category_justification}

                            </p>

                          )}

                        </div>

                      </div>

                      <div className="flex flex-col items-end gap-2">

                        <div className="text-right">

                          <div className="text-xs text-gray-500">LDL-c atual</div>

                          <div className="text-xl font-bold text-gray-900">

                            {assessment.ldl_current}

                            <span className="text-sm font-normal text-gray-500 ml-1">mg/dL</span>

                          </div>

                        </div>

                        <div className="text-right">

                          <div className="text-xs text-gray-500">Meta</div>

                          <div className="font-semibold text-blue-600">

                            ≤{assessment.ldl_target} mg/dL

                          </div>

                        </div>

                        {!assessment.ldl_at_target && assessment.ldl_reduction_needed > 0 && (

                          <Badge variant="outline" className="text-xs">

                            Reduzir {assessment.ldl_reduction_needed}%

                          </Badge>

                        )}

                        <Link to={`${createPageUrl("NewAssessment")}?id=${assessment.id}`}>

                          <Button variant="outline" size="sm" className="gap-1">

                            <ChevronRight className="w-4 h-4" />

                            Abrir

                          </Button>

                        </Link>

                      </div>

                    </div>

                    {/* Alerts preview */}

                    {assessment.alerts?.length > 0 && (

                      <div className="mt-3 pt-3 border-t">

                        <div className="flex items-center gap-2 text-sm text-amber-600">

                          <AlertTriangle className="w-4 h-4" />

                          {assessment.alerts.length} alerta(s) identificado(s)

                        </div>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </CardContent>

        </Card>

      </div>

    </div>

  );

}
