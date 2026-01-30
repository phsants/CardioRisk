import React, { useState } from "react";

import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { createPageUrl } from "@/utils";

import { 

  ArrowLeft,

  Heart,

  Target,

  AlertTriangle,

  CheckCircle2,

  Info,

  ChevronRight,

  BookOpen,

  Activity,

  Users,

  Beaker,

  Stethoscope

} from "lucide-react";

import { 

  RISK_CATEGORIES,

  EXTREME_RISK_CRITERIA,

  VERY_HIGH_RISK_CRITERIA,

  HIGH_RISK_CRITERIA,

  INTERMEDIATE_RISK_CRITERIA,

  RISK_MODIFIERS,

  LIPID_REFERENCE_VALUES,

  DUTCH_LIPID_CLINIC_CRITERIA,

  SCORING_TABLES

} from "@/components/guidelines/GuidelineData";



export default function Guidelines() {

  const [selectedCategory, setSelectedCategory] = useState("very_high");



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

            <h1 className="text-2xl font-bold text-gray-900">Diretriz SBC 2025</h1>

            <p className="text-sm text-gray-500">

              Dislipidemias e Prevenção da Aterosclerose

            </p>

          </div>

        </div>



        <Tabs defaultValue="categories" className="space-y-6">

          <TabsList className="bg-white shadow-sm p-1 rounded-xl w-full flex flex-nowrap gap-1 min-h-[2.75rem]">
            <TabsTrigger value="categories" title="Categorias" className="rounded-lg flex-1 min-w-0 shrink-0 sm:shrink-0 flex items-center justify-center gap-0 sm:gap-2 py-2 px-2 sm:px-3">
              <Heart className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline truncate">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="targets" title="Metas" className="rounded-lg flex-1 min-w-0 shrink-0 sm:shrink-0 flex items-center justify-center gap-0 sm:gap-2 py-2 px-2 sm:px-3">
              <Target className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline truncate">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="criteria" title="Critérios" className="rounded-lg flex-1 min-w-0 shrink-0 sm:shrink-0 flex items-center justify-center gap-0 sm:gap-2 py-2 px-2 sm:px-3">
              <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline truncate">Critérios</span>
            </TabsTrigger>
            <TabsTrigger value="reference" title="Referência" className="rounded-lg flex-1 min-w-0 shrink-0 sm:shrink-0 flex items-center justify-center gap-0 sm:gap-2 py-2 px-2 sm:px-3">
              <Beaker className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline truncate">Referência</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" title="Escore" className="rounded-lg flex-1 min-w-0 shrink-0 sm:shrink-0 flex items-center justify-center gap-0 sm:gap-2 py-2 px-2 sm:px-3">
              <Activity className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline truncate">Escore</span>
            </TabsTrigger>
          </TabsList>



          {/* Categories Tab */}

          <TabsContent value="categories">

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {Object.values(RISK_CATEGORIES).map((category) => (

                <Card 

                  key={category.id}

                  className={`border-0 shadow-lg cursor-pointer transition-all hover:scale-105 ${

                    selectedCategory === category.id ? "ring-2 ring-offset-2" : ""

                  }`}

                  style={{ 

                    borderColor: category.color,

                    ...(selectedCategory === category.id && { ringColor: category.color })

                  }}

                  onClick={() => setSelectedCategory(category.id)}

                >

                  <CardHeader 

                    className="rounded-t-lg"

                    style={{ backgroundColor: `${category.color}15` }}

                  >

                    <div className="flex items-center gap-3">

                      <div

                        className="w-10 h-10 rounded-full flex items-center justify-center"

                        style={{ backgroundColor: category.color }}

                      >

                        <Heart className="w-5 h-5 text-white" />

                      </div>

                      <div>

                        <CardTitle 

                          className="text-lg"

                          style={{ color: category.color }}

                        >

                          {category.name}

                        </CardTitle>

                      </div>

                    </div>

                  </CardHeader>

                  <CardContent className="pt-4">

                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                    <div className="grid grid-cols-3 gap-2 text-center">

                      <div className="bg-gray-50 rounded-lg p-2">

                        <div className="text-lg font-bold text-gray-900">≤{category.ldl_target}</div>

                        <div className="text-xs text-gray-500">LDL-c</div>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-2">

                        <div className="text-lg font-bold text-gray-900">≤{category.non_hdl_target}</div>

                        <div className="text-xs text-gray-500">Não-HDL</div>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-2">

                        <div className="text-lg font-bold text-gray-900">≤{category.apo_b_target}</div>

                        <div className="text-xs text-gray-500">ApoB</div>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              ))}

            </div>

          </TabsContent>



          {/* Targets Tab */}

          <TabsContent value="targets">

            <Card className="border-0 shadow-lg">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <Target className="w-5 h-5 text-blue-600" />

                  Metas Lipídicas por Categoria de Risco

                </CardTitle>

                <CardDescription>

                  Valores alvo para LDL-c, Não-HDL-c e ApoB conforme estratificação de risco

                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b">

                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>

                        <th className="text-center py-3 px-4 font-semibold text-gray-700">LDL-c (mg/dL)</th>

                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Não-HDL-c (mg/dL)</th>

                        <th className="text-center py-3 px-4 font-semibold text-gray-700">ApoB (mg/dL)</th>

                      </tr>

                    </thead>

                    <tbody>

                      {Object.values(RISK_CATEGORIES).map((category) => (

                        <tr key={category.id} className="border-b hover:bg-gray-50">

                          <td className="py-3 px-4">

                            <div className="flex items-center gap-2">

                              <div

                                className="w-3 h-3 rounded-full"

                                style={{ backgroundColor: category.color }}

                              />

                              <span className="font-medium">{category.name}</span>

                            </div>

                          </td>

                          <td className="py-3 px-4 text-center">

                            <Badge 

                              className="text-white"

                              style={{ backgroundColor: category.color }}

                            >

                              ≤ {category.ldl_target}

                            </Badge>

                          </td>

                          <td className="py-3 px-4 text-center">

                            <Badge variant="outline">≤ {category.non_hdl_target}</Badge>

                          </td>

                          <td className="py-3 px-4 text-center">

                            <Badge variant="outline">≤ {category.apo_b_target}</Badge>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>



                <div className="mt-6 p-4 bg-blue-50 rounded-lg">

                  <div className="flex items-start gap-2">

                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

                    <div className="text-sm text-blue-800">

                      <strong>Observações importantes:</strong>

                      <ul className="mt-2 space-y-1 list-disc list-inside">

                        <li>O LDL-c é o alvo primário de tratamento</li>

                        <li>Não-HDL-c é calculado como: Colesterol Total - HDL-c</li>

                        <li>ApoB reflete melhor o número de partículas aterogênicas</li>

                        <li>Em pacientes com TG elevado, Não-HDL-c e ApoB ganham importância</li>

                      </ul>

                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>

          </TabsContent>



          {/* Criteria Tab */}

          <TabsContent value="criteria">

            <div className="space-y-4">

              <Accordion type="single" collapsible className="space-y-4">

                {/* Risco Extremo */}

                <AccordionItem value="extreme" className="border-0">

                  <Card className="border-0 shadow-md overflow-hidden">

                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">

                      <div className="flex items-center gap-3">

                        <div 

                          className="w-10 h-10 rounded-full flex items-center justify-center"

                          style={{ backgroundColor: RISK_CATEGORIES.extreme.color }}

                        >

                          <AlertTriangle className="w-5 h-5 text-white" />

                        </div>

                        <div className="text-left">

                          <h3 className="font-semibold text-lg">Risco Extremo</h3>

                          <p className="text-sm text-gray-500">Meta LDL-c ≤ 30 mg/dL</p>

                        </div>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4">

                      <div className="space-y-3 mt-2">

                        {EXTREME_RISK_CRITERIA.map((criterion) => (

                          <div key={criterion.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">

                            <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />

                            <span className="text-sm text-gray-700">{criterion.description}</span>

                          </div>

                        ))}

                      </div>

                    </AccordionContent>

                  </Card>

                </AccordionItem>



                {/* Muito Alto Risco */}

                <AccordionItem value="very_high" className="border-0">

                  <Card className="border-0 shadow-md overflow-hidden">

                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">

                      <div className="flex items-center gap-3">

                        <div 

                          className="w-10 h-10 rounded-full flex items-center justify-center"

                          style={{ backgroundColor: RISK_CATEGORIES.very_high.color }}

                        >

                          <Heart className="w-5 h-5 text-white" />

                        </div>

                        <div className="text-left">

                          <h3 className="font-semibold text-lg">Muito Alto Risco</h3>

                          <p className="text-sm text-gray-500">Meta LDL-c ≤ 50 mg/dL</p>

                        </div>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4">

                      <div className="space-y-3 mt-2">

                        {VERY_HIGH_RISK_CRITERIA.map((criterion) => (

                          <div key={criterion.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">

                            <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />

                            <span className="text-sm text-gray-700">{criterion.description}</span>

                          </div>

                        ))}

                      </div>

                    </AccordionContent>

                  </Card>

                </AccordionItem>



                {/* Alto Risco */}

                <AccordionItem value="high" className="border-0">

                  <Card className="border-0 shadow-md overflow-hidden">

                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">

                      <div className="flex items-center gap-3">

                        <div 

                          className="w-10 h-10 rounded-full flex items-center justify-center"

                          style={{ backgroundColor: RISK_CATEGORIES.high.color }}

                        >

                          <Heart className="w-5 h-5 text-white" />

                        </div>

                        <div className="text-left">

                          <h3 className="font-semibold text-lg">Alto Risco</h3>

                          <p className="text-sm text-gray-500">Meta LDL-c ≤ 70 mg/dL</p>

                        </div>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4">

                      <div className="space-y-3 mt-2">

                        {HIGH_RISK_CRITERIA.map((criterion) => (

                          <div key={criterion.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">

                            <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />

                            <span className="text-sm text-gray-700">{criterion.description}</span>

                          </div>

                        ))}

                      </div>

                    </AccordionContent>

                  </Card>

                </AccordionItem>



                {/* Risco Intermediário */}

                <AccordionItem value="intermediate" className="border-0">

                  <Card className="border-0 shadow-md overflow-hidden">

                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">

                      <div className="flex items-center gap-3">

                        <div 

                          className="w-10 h-10 rounded-full flex items-center justify-center"

                          style={{ backgroundColor: RISK_CATEGORIES.intermediate.color }}

                        >

                          <Heart className="w-5 h-5 text-white" />

                        </div>

                        <div className="text-left">

                          <h3 className="font-semibold text-lg">Risco Intermediário</h3>

                          <p className="text-sm text-gray-500">Meta LDL-c ≤ 100 mg/dL</p>

                        </div>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-4">

                      <div className="space-y-3 mt-2">

                        {INTERMEDIATE_RISK_CRITERIA.map((criterion) => (

                          <div key={criterion.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">

                            <CheckCircle2 className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

                            <span className="text-sm text-gray-700">{criterion.description}</span>

                          </div>

                        ))}

                      </div>

                    </AccordionContent>

                  </Card>

                </AccordionItem>

              </Accordion>



              {/* Modificadores de Risco */}

              <Card className="border-0 shadow-lg mt-6">

                <CardHeader>

                  <CardTitle className="flex items-center gap-2">

                    <Activity className="w-5 h-5 text-purple-600" />

                    Modificadores de Risco

                  </CardTitle>

                  <CardDescription>

                    Fatores que podem elevar a categoria de risco

                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <div className="grid md:grid-cols-2 gap-3">

                    {RISK_MODIFIERS.map((modifier) => (

                      <div key={modifier.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">

                        <AlertTriangle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />

                        <div>

                          <p className="text-sm font-medium text-gray-700">{modifier.description}</p>

                          <Badge variant="outline" className="mt-1 text-xs">

                            {modifier.action === "upgrade_one_category" && "↑ Eleva 1 categoria"}

                            {modifier.action === "upgrade_to_very_high" && "↑↑ Eleva para Muito Alto"}

                            {modifier.action === "consider_upgrade" && "Considerar elevação"}

                            {modifier.action === "metabolic_alert" && "Alerta metabólico"}

                          </Badge>

                        </div>

                      </div>

                    ))}

                  </div>

                </CardContent>

              </Card>

            </div>

          </TabsContent>



          {/* Reference Values Tab */}

          <TabsContent value="reference">

            <div className="grid md:grid-cols-2 gap-6">

              {/* Colesterol Total */}

              <Card className="border-0 shadow-md">

                <CardHeader>

                  <CardTitle className="text-lg">Colesterol Total</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-2">

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Desejável</span>

                      <Badge className="bg-green-500">{"<"} 190 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">

                      <span>Limítrofe</span>

                      <Badge className="bg-yellow-500">190-239 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">

                      <span>Elevado</span>

                      <Badge className="bg-red-500">≥ 240 mg/dL</Badge>

                    </div>

                  </div>

                </CardContent>

              </Card>



              {/* LDL-c */}

              <Card className="border-0 shadow-md">

                <CardHeader>

                  <CardTitle className="text-lg">LDL-c</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-2">

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Ótimo</span>

                      <Badge className="bg-green-500">{"<"} 100 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Desejável</span>

                      <Badge className="bg-green-400">100-129 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">

                      <span>Limítrofe</span>

                      <Badge className="bg-yellow-500">130-159 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">

                      <span>Alto</span>

                      <Badge className="bg-orange-500">160-189 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">

                      <span>Muito Alto</span>

                      <Badge className="bg-red-500">≥ 190 mg/dL</Badge>

                    </div>

                  </div>

                </CardContent>

              </Card>



              {/* HDL-c */}

              <Card className="border-0 shadow-md">

                <CardHeader>

                  <CardTitle className="text-lg">HDL-c</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-2">

                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">

                      <span>Baixo</span>

                      <Badge className="bg-red-500">{"<"} 40 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">

                      <span>Normal</span>

                      <Badge variant="outline">40-60 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Desejável</span>

                      <Badge className="bg-green-500">≥ 60 mg/dL</Badge>

                    </div>

                  </div>

                </CardContent>

              </Card>



              {/* Triglicerídeos */}

              <Card className="border-0 shadow-md">

                <CardHeader>

                  <CardTitle className="text-lg">Triglicerídeos</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-2">

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Normal</span>

                      <Badge className="bg-green-500">{"<"} 150 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">

                      <span>Limítrofe</span>

                      <Badge className="bg-yellow-500">150-199 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">

                      <span>Alto</span>

                      <Badge className="bg-orange-500">200-499 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">

                      <span>Muito Alto</span>

                      <Badge className="bg-red-500">≥ 500 mg/dL</Badge>

                    </div>

                  </div>

                </CardContent>

              </Card>



              {/* Lipoproteína(a) */}

              <Card className="border-0 shadow-md">

                <CardHeader>

                  <CardTitle className="text-lg">Lipoproteína(a)</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-2">

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Normal</span>

                      <Badge className="bg-green-500">{"<"} 75 nmol/L ({"<"} 30 mg/dL)</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">

                      <span>Elevado</span>

                      <Badge className="bg-yellow-500">75-125 nmol/L</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">

                      <span>Alto</span>

                      <Badge className="bg-red-500">≥ 125 nmol/L (≥ 50 mg/dL)</Badge>

                    </div>

                  </div>

                  <p className="text-xs text-gray-500 mt-2">

                    * Conversão aproximada: 1 mg/dL ≈ 2,5 nmol/L

                  </p>

                </CardContent>

              </Card>



              {/* ApoB */}

              <Card className="border-0 shadow-md">

                <CardHeader>

                  <CardTitle className="text-lg">Apolipoproteína B (ApoB)</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-2">

                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">

                      <span>Ótimo</span>

                      <Badge className="bg-green-500">{"<"} 100 mg/dL</Badge>

                    </div>

                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">

                      <span>Elevado</span>

                      <Badge className="bg-yellow-500">≥ 100 mg/dL</Badge>

                    </div>

                  </div>

                  <p className="text-xs text-gray-500 mt-2">

                    * A meta de ApoB varia conforme a categoria de risco

                  </p>

                </CardContent>

              </Card>

            </div>

          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Escala de Escore para Risco Global
                  </CardTitle>
                  <CardDescription>
                    Tabelas de atribuição de pontos e mapeamento de risco em 10 anos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="women" className="space-y-4">
                    <TabsList className="bg-white shadow-sm p-1 rounded-xl">
                      <TabsTrigger value="women" className="rounded-lg">
                        <Users className="w-4 h-4 mr-2" />
                        Mulheres
                      </TabsTrigger>
                      <TabsTrigger value="men" className="rounded-lg">
                        <Users className="w-4 h-4 mr-2" />
                        Homens
                      </TabsTrigger>
                    </TabsList>

                    {/* Women Scoring */}
                    <TabsContent value="women" className="space-y-6">
                      {/* Point Assignment Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Atribuição de pontos de acordo com o risco global, para mulheres
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                  Fator
                                </th>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => (
                                  <th
                                    key={point}
                                    className={`border border-gray-300 px-3 py-2 text-center font-semibold text-sm ${
                                      point < 0
                                        ? "bg-green-100 text-green-800"
                                        : point === 0
                                        ? "bg-white"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {point}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {/* Idade */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Idade em anos
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const ageData = SCORING_TABLES.women.pointAssignment.age.find(
                                    (a) => a.points === point
                                  );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        ageData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {ageData ? ageData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* HDL-C */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  HDL-C (mg/dL)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const hdlData = SCORING_TABLES.women.pointAssignment.hdl_c.find(
                                    (h) => h.points === point
                                  );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        hdlData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {hdlData ? hdlData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Colesterol Total */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Colesterol total (mg/dL)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const cholData =
                                    SCORING_TABLES.women.pointAssignment.total_cholesterol.find(
                                      (c) => c.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        cholData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {cholData ? cholData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* PAS Não Tratada */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  PAS – não tratada (mmHg)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const sbpData =
                                    SCORING_TABLES.women.pointAssignment.sbp_untreated.find(
                                      (s) => s.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        sbpData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {sbpData ? sbpData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* PAS Tratada */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  PAS – tratada (mmHg)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const sbpData =
                                    SCORING_TABLES.women.pointAssignment.sbp_treated.find(
                                      (s) => s.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        sbpData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {sbpData ? sbpData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Fumo */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Fumo
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const smokingData =
                                    SCORING_TABLES.women.pointAssignment.smoking.find(
                                      (s) => s.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        smokingData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {smokingData ? smokingData.value : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Diabetes */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Diabetes
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const diabetesData =
                                    SCORING_TABLES.women.pointAssignment.diabetes.find(
                                      (d) => d.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        diabetesData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {diabetesData ? diabetesData.value : ""}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Risk Mapping Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Risco global em 10 anos, para mulheres
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                              <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Pontos
                                  </th>
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Risco (%)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {SCORING_TABLES.women.riskMapping.slice(0, 12).map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                      {item.points}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {item.risk}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                              <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Pontos
                                  </th>
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Risco (%)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {SCORING_TABLES.women.riskMapping.slice(12).map((item, idx) => (
                                  <tr
                                    key={idx + 12}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                      {item.points}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {item.risk}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Men Scoring */}
                    <TabsContent value="men" className="space-y-6">
                      {/* Point Assignment Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Atribuição de pontos de acordo com o risco global, para homens
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                  Fator
                                </th>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => (
                                  <th
                                    key={point}
                                    className={`border border-gray-300 px-3 py-2 text-center font-semibold text-sm ${
                                      point < 0
                                        ? "bg-green-100 text-green-800"
                                        : point === 0
                                        ? "bg-white"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {point}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {/* Idade */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Idade em anos
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const ageData = SCORING_TABLES.men.pointAssignment.age.find(
                                    (a) => a.points === point
                                  );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        ageData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {ageData ? ageData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* HDL-C */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  HDL-C (mg/dL)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const hdlData = SCORING_TABLES.men.pointAssignment.hdl_c.find(
                                    (h) => h.points === point
                                  );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        hdlData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {hdlData ? hdlData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Colesterol Total */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Colesterol total (mg/dL)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const cholData =
                                    SCORING_TABLES.men.pointAssignment.total_cholesterol.find(
                                      (c) => c.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        cholData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {cholData ? cholData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* PAS Não Tratada */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  PAS – não tratada (mmHg)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const sbpData =
                                    SCORING_TABLES.men.pointAssignment.sbp_untreated.find(
                                      (s) => s.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        sbpData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {sbpData ? sbpData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* PAS Tratada */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  PAS – tratada (mmHg)
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const sbpData =
                                    SCORING_TABLES.men.pointAssignment.sbp_treated.find(
                                      (s) => s.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        sbpData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {sbpData ? sbpData.range : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Fumo */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Fumo
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const smokingData =
                                    SCORING_TABLES.men.pointAssignment.smoking.find(
                                      (s) => s.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        smokingData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {smokingData ? smokingData.value : ""}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Diabetes */}
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                                  Diabetes
                                </td>
                                {Array.from({ length: 18 }, (_, i) => i - 2).map((point) => {
                                  const diabetesData =
                                    SCORING_TABLES.men.pointAssignment.diabetes.find(
                                      (d) => d.points === point
                                    );
                                  return (
                                    <td
                                      key={point}
                                      className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                                        diabetesData ? "bg-blue-100 font-medium" : ""
                                      }`}
                                    >
                                      {diabetesData ? diabetesData.value : ""}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Risk Mapping Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Risco global em 10 anos, para homens
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                              <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Pontos
                                  </th>
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Risco (%)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {SCORING_TABLES.men.riskMapping.slice(0, 11).map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                      {item.points}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {item.risk}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                              <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Pontos
                                  </th>
                                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                    Risco (%)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {SCORING_TABLES.men.riskMapping.slice(11).map((item, idx) => (
                                  <tr
                                    key={idx + 11}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                      {item.points}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {item.risk}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>



        {/* Footer */}

        <div className="text-center mt-12 text-sm text-gray-500">

          <p>Fonte: Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose</p>

          <p className="font-medium text-gray-700">Sociedade Brasileira de Cardiologia - 2025</p>

        </div>

      </div>

    </div>

  );

}
