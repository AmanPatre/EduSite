"use client";

import React from "react";
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  AreaChart,
  BadgeDelta,
  Flex,
  Metric,
  ProgressBar,
  Grid,
} from "@tremor/react";
import { GLOBAL_TRENDS } from "@/data/fakeTrends";
import { AlertTriangle, Brain, Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TrendingPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-10">
      <div className="mx-auto max-w-7xl space-y-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Title className="text-3xl font-bold text-slate-100">
              Global Market Intelligence
            </Title>
            <Text className="text-slate-400">
              Live analysis of skill demand, salary trends, and learning momentum.
            </Text>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live Data • Updated {GLOBAL_TRENDS.lastUpdated}
          </div>
        </div>

        {/* --- SECTION 1: MARKET MOVERS (Sparkline Cards) --- */}
        <Grid numItemsMd={2} numItemsLg={3} className="gap-6">
          {GLOBAL_TRENDS.snapshot.map((item) => (
            <Link key={item.id} href={`/trending/${item.slug}`} className="block h-full">
              <Card 
                className="h-full transform transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 bg-slate-900 border-slate-800 ring-0"
              >
                <Flex alignItems="start">
                  <div>
                    <Text className="text-slate-400">Market Mover</Text>
                    <Metric className="text-slate-100 mt-1">{item.name}</Metric>
                  </div>
                  <BadgeDelta
                    deltaType={item.trend === "up" ? "increase" : "moderateIncrease"}
                    isIncreasePositive={true}
                    size="xs"
                  >
                    {item.growth}
                  </BadgeDelta>
                </Flex>
                
                <Flex className="mt-4 space-x-2">
                   <div className="text-slate-400 text-sm">
                      Velocity: <span className="text-white font-medium">{item.velocity}</span>
                   </div>
                </Flex>

                {/* Tremor Chart */}
                <AreaChart
                  className="mt-6 h-28"
                  data={item.sparklineData.map((val, i) => ({
                    index: i,
                    "Interest": val,
                  }))}
                  index="index"
                  categories={["Interest"]}
                  colors={item.color.includes("purple") ? ["purple"] : item.color.includes("blue") ? ["blue"] : ["emerald"]}
                  showXAxis={false}
                  showYAxis={false}
                  showLegend={false}
                  showGridLines={false}
                  showAnimation={true}
                  curveType="monotone"
                />
              </Card>
            </Link>
          ))}
        </Grid>

        {/* --- SECTION 2: DEEP DIVE TABS --- */}
        <TabGroup>
          <TabList className="mt-4" variant="solid" color="slate">
            <Tab className="text-slate-300 ui-selected:text-white ui-selected:bg-slate-800">Frontend</Tab>
            <Tab className="text-slate-300 ui-selected:text-white ui-selected:bg-slate-800">Backend</Tab>
            <Tab className="text-slate-300 ui-selected:text-white ui-selected:bg-slate-800">AI / ML</Tab>
          </TabList>
          
          <TabPanels>
            {/* Map over categories keys: 'frontend', 'backend', 'ai' */}
            {(['frontend', 'backend', 'ai'] as const).map((categoryKey) => (
              <TabPanel key={categoryKey}>
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  
                  {/* LEFT: Skill List (Takes 2 cols) */}
                  <Card className="lg:col-span-2 bg-slate-900 border-slate-800 ring-0 p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                      <Title className="text-slate-100">Skill Demand Matrix</Title>
                      <Text className="text-slate-400">Comparing job demand vs. learning momentum</Text>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950/50 text-xs uppercase font-medium">
                          <tr>
                            <th className="px-6 py-4">Technology</th>
                            <th className="px-6 py-4">Job Demand</th>
                            <th className="px-6 py-4">Avg Salary</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {GLOBAL_TRENDS.categories[categoryKey].map((skill, idx) => (
                            <tr key={idx} className="group hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-200">
                                {skill.name}
                              </td>
                              <td className="px-6 py-4">
                                <Flex justifyContent="start" className="space-x-2">
                                  <ProgressBar 
                                    value={
                                      skill.demand === "Critical" ? 100 : 
                                      skill.demand === "Very High" ? 85 : 
                                      skill.demand === "High" ? 70 : 50
                                    } 
                                    color={
                                      skill.demand === "Critical" ? "purple" : 
                                      skill.demand === "Very High" ? "emerald" : "blue"
                                    } 
                                    className="w-24" 
                                  />
                                  <span className="text-xs">{skill.demand}</span>
                                </Flex>
                              </td>
                              <td className="px-6 py-4">{skill.salary}</td>
                              <td className="px-6 py-4 text-right">
                                <Link 
                                  href={`/trending/${skill.slug}`} 
                                  className="text-blue-400 hover:text-blue-300 text-xs font-bold"
                                >
                                  View Data &rarr;
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* RIGHT: Winning Stacks (Takes 1 col) */}
                  <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800 ring-0">
                      <Title className="mb-4 text-slate-100 flex items-center gap-2">
                        <TrendingUp size={18} className="text-pink-500" /> Winning Stacks
                      </Title>
                      <div className="space-y-4">
                        {GLOBAL_TRENDS.stacks.map((stack, i) => (
                          <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                             <Flex>
                                <Text className="font-medium text-slate-200">{stack.name}</Text>
                                <BadgeDelta deltaType="increase" size="xs">Trending</BadgeDelta>
                             </Flex>
                             <div className="mt-2 flex flex-wrap gap-1">
                                {stack.components.map(tech => (
                                  <span key={tech} className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-400">
                                    {tech}
                                  </span>
                                ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    {/* Insight Card (Mini) */}
                    <Card decoration="top" decorationColor="cyan" className="bg-slate-900 border-slate-800 ring-0">
                      <Flex justifyContent="start" alignItems="center" className="space-x-2">
                         <Brain size={20} className="text-cyan-400" />
                         <Title className="text-slate-100">AI Prediction</Title>
                      </Flex>
                      <Text className="mt-2 text-slate-400">
                        "Full-stack engineers with vector database skills will see a 40% salary premium in 2025."
                      </Text>
                    </Card>
                  </div>

                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>

        {/* --- SECTION 3: ANALYST INSIGHTS --- */}
        <Grid numItemsMd={3} className="gap-6">
          {GLOBAL_TRENDS.insights.map((insight, idx) => (
            <Card key={idx} className="bg-slate-900 border-slate-800 ring-0">
              <Flex justifyContent="start" alignItems="center" className="mb-4 space-x-2">
                {insight.type === 'warning' ? <AlertTriangle className="text-amber-500" /> : 
                 insight.type === 'opportunity' ? <Lightbulb className="text-emerald-500" /> : 
                 <Brain className="text-blue-500" />}
                <Text className="uppercase tracking-widest text-xs font-bold text-slate-500">
                  {insight.type}
                </Text>
              </Flex>
              <Metric className="text-xl text-slate-100 mb-2">{insight.title}</Metric>
              <Text className="text-slate-400">
                {insight.text}
              </Text>
            </Card>
          ))}
        </Grid>
      </div>
    </main>
  );
}