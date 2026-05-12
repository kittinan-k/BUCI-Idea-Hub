/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, 
  Target, 
  Layers, 
  Type as TypeIcon, 
  Copy, 
  RefreshCw, 
  ChevronRight, 
  BookOpen, 
  Heart, 
  Music, 
  Briefcase, 
  Palette, 
  CheckCircle2,
  AlertCircle,
  Users,
  Coins,
  Globe,
  Star,
  Building2,
  BadgeCheck,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
interface ActivityIdea {
  name: string;
  concept: string;
  benefits: {
    organizer: string;
    participant: string;
    college: string;
    university: string;
  };
  dnaAlignment: string;
  sdgAlignment: {
    goals: string[];
    explanation: string;
  };
  actionPlan: string[];
  expectedOutcome: string;
  budget: {
    item: string;
    price: string;
  }[];
  roles: {
    president: string;
    vicePresident: string;
    secretary: string;
    treasurer: string;
    pr: string;
    recreation: string;
    academic: string;
    welfare: string;
  };
  coordination: {
    facilities: string;
    pr: string;
    businessChineseDept: string;
  };
}

const CATEGORIES = [
  { id: "business", label: "ทักษะธุรกิจ & การค้า", labelCn: "商务技能", icon: Briefcase },
  { id: "academic", label: "วิชาการ & ภาษา", labelCn: "学术与语言", icon: BookOpen },
  { id: "volunteer", label: "จิตอาสา & รักษ์โลก", labelCn: "志愿服务", icon: Heart },
  { id: "entertainment", label: "บันเทิง & วัฒนธรรม", labelCn: "娱乐与文化", icon: Music },
  { id: "skills", label: "กีฬา & พัฒนาตนเอง", labelCn: "技能发展", icon: Palette },
];

const AUDIENCES = [
  { id: "freshmen", label: "นักศึกษาชั้นปีที่ 1", labelCn: "一年级新生" },
  { id: "sophomore", label: "นักศึกษาชั้นปีที่ 2", labelCn: "二年级学生" },
  { id: "junior", label: "นักศึกษาชั้นปีที่ 3", labelCn: "三年级学生" },
  { id: "senior", label: "นักศึกษาชั้นปีที่ 4", labelCn: "四年级学生" },
  { id: "all", label: "นักศึกษาทั้งคณะ", labelCn: "全院学生" },
  { id: "other", label: "อื่นๆ (สามารถระบุรายละเอียดได้)", labelCn: "其他" },
];

export default function App() {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [audience, setAudience] = useState<string[]>([AUDIENCES[4].id]);
  const [customAudience, setCustomAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [participants, setParticipants] = useState(50);
  const [duration, setDuration] = useState<"full" | "half">("half");
  const [speakerHours, setSpeakerHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActivityIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateIdea = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use the provided Gemini API access via environment variable
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const selectedCat = CATEGORIES.find(c => c.id === category);
      const selectedAuds = AUDIENCES.filter(a => audience.includes(a.id));
      const targetAudience = selectedAuds.map(a => 
        a.id === "other" ? (customAudience || "อื่นๆ") : a.label
      ).join(", ");

      const prompt = `
        You are a creative activity consultant for Bangkok University International College (BUIC).
        Goal: Generate an innovative, non-traditional student activity idea.
        The activity MUST blend Chinese culture/language with modern business or social trends (Pitching, Startups, Digital Marketing, etc.).
        
        Input Context:
        - Category: ${selectedCat?.label} (${selectedCat?.labelCn})
        - Target Audience: ${targetAudience}
        - Theme/Keywords: ${keywords || "Creative, Business, China, Future"}
        
        Specific Requirements for the output:
        1. Name: Catchy and professional, include both Thai and Simplified Chinese (HSK5 level).
        2. Concept: Exactly 1 sentence summarizing the "What" and "Why".
        3. Benefits: Detailed benefits for organizers, participants, the college (BUIC), and the university (BU).
        4. DNA Alignment: How it fits with BU DNAs (Creativity, Curiosity, Street Smart, Collaboration, International Mindset).
        5. SDG Alignment: 1-3 relevant UN SDGs and an explanation.
        6. Action Plan: 3 to 5 clear implementation steps (Preparation, Action, Wrap-up).
        7. Expected Outcome: Practical benefits and Learning Outcomes (ELOs) for students.
        8. Budget: List of items needed with approximate prices in THB. 
           - **Crucial Food Regulation**: Food and Snack budget must follow university rules (Full day max 55 THB/person, Half day max 25 THB/person).
           - **Speaker Regulation**: Speaker fee (ค่าตอบแทนวิทยากร) must be exactly 1,000 THB per hour.
        9. Roles: Specific duties for President, VP, Secretary, Treasurer, PR, Recreation, Academic, and Welfare (Friendly & Professional Thai).
        10. Coordination: Guidance for coordinating with Facilities, University PR, and the Chinese Business Dept at BUIC.
        
        Vibe: Future-forward, creative, energetic, and business-focused (Innovative Business Chinese).
        Response Language: Thai (Professional yet friendly tone).
        
        Return ONLY valid JSON in this format:
        {
          "name": "ชื่อกิจกรรม (Chinese Name)",
          "concept": "...",
          "benefits": { "organizer": "...", "participant": "...", "college": "...", "university": "..." },
          "dnaAlignment": "...",
          "sdgAlignment": { "goals": ["SDG X", "SDG Y"], "explanation": "..." },
          "actionPlan": ["...", "..."],
          "expectedOutcome": "...",
          "budget": [{ "item": "...", "price": "..." }],
          "roles": { "president": "...", "vicePresident": "...", "secretary": "...", "treasurer": "...", "pr": "...", "recreation": "...", "academic": "...", "welfare": "..." },
          "coordination": { "facilities": "...", "pr": "...", "businessChineseDept": "..." }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              concept: { type: Type.STRING },
              benefits: {
                type: Type.OBJECT,
                properties: {
                  organizer: { type: Type.STRING },
                  participant: { type: Type.STRING },
                  college: { type: Type.STRING },
                  university: { type: Type.STRING }
                },
                required: ["organizer", "participant", "college", "university"]
              },
              dnaAlignment: { type: Type.STRING },
              sdgAlignment: {
                type: Type.OBJECT,
                properties: {
                  goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  explanation: { type: Type.STRING }
                },
                required: ["goals", "explanation"]
              },
              actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectedOutcome: { type: Type.STRING },
              budget: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    price: { type: Type.STRING }
                  },
                  required: ["item", "price"]
                }
              },
              roles: {
                type: Type.OBJECT,
                properties: {
                  president: { type: Type.STRING },
                  vicePresident: { type: Type.STRING },
                  secretary: { type: Type.STRING },
                  treasurer: { type: Type.STRING },
                  pr: { type: Type.STRING },
                  recreation: { type: Type.STRING },
                  academic: { type: Type.STRING },
                  welfare: { type: Type.STRING }
                },
                required: ["president", "vicePresident", "secretary", "treasurer", "pr", "recreation", "academic", "welfare"]
              },
              coordination: {
                type: Type.OBJECT,
                properties: {
                  facilities: { type: Type.STRING },
                  pr: { type: Type.STRING },
                  businessChineseDept: { type: Type.STRING }
                },
                required: ["facilities", "pr", "businessChineseDept"]
              }
            },
            required: ["name", "concept", "benefits", "dnaAlignment", "sdgAlignment", "actionPlan", "expectedOutcome", "budget", "roles", "coordination"],
          },
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `ชื่อกิจกรรม: ${result.name}
Concept: ${result.concept}

ประโยชน์ที่ได้รับ:
- ผู้จัดงาน: ${result.benefits.organizer}
- ผู้เข้าร่วม: ${result.benefits.participant}
- วิทยาลัย: ${result.benefits.college}
- มหาวิทยาลัย: ${result.benefits.university}

BU DNA: ${result.dnaAlignment}
SDGs: ${result.sdgAlignment.goals.join(", ")} (${result.sdgAlignment.explanation})

ขั้นตอนการดำเนินงาน:
${result.actionPlan.map((s, i) => `${i + 1}. ${s}`).join("\n")}

ผลที่คาดว่าจะได้รับ (ELOs): ${result.expectedOutcome}

งบประมาณเบื้องต้น:
${result.budget.map(b => `- ${b.item}: ${b.price}`).join("\n")}

การแบ่งงาน (Roles):
- ประธาน: ${result.roles.president}
- รองประธาน: ${result.roles.vicePresident}
- เลขาฯ: ${result.roles.secretary}
- เหรัญญิก: ${result.roles.treasurer}
- ประชาสัมพันธ์: ${result.roles.pr}
- สันทนาการ: ${result.roles.recreation}
- วิชาการ: ${result.roles.academic}
- สวัสดิการ: ${result.roles.welfare}

การประสานงานภายใน:
- ฝ่ายอาคารฯ: ${result.coordination.facilities}
- ฝ่าย PR: ${result.coordination.pr}
- สาขาภาษาจีนธุรกิจ: ${result.coordination.businessChineseDept}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] font-sans selection:bg-cyan-100">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-rose-50 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* Hero Section */}
      <section className="relative h-[450px] overflow-hidden flex items-center justify-center text-white mb-20">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=1920&h=1080"
          alt="Chinese Business District"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 container max-w-5xl px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Next-Gen China Biz Platform</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 font-display"
          >
            创新生活 <span className="text-cyan-400">Idea Hub</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            ระดมสมองและนำเสนอไอเดียกิจกรรมก้าวหน้า 
            ผสานกลยุทธ์ธุรกิจและวัฒนธรรมจีนยุคใหม่ สู่ความเป็นมืออาชีพครีเอทีฟ
          </motion.p>
        </div>
        
        {/* Floating elements to boost "Creative" feeling */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFDFD] to-transparent z-20" />
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-0 mb-32 -mt-32 relative z-30">
        {/* Pitching Intro Card */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="grid md:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-[#EBEBEB] flex flex-col justify-center">
            <h3 className="text-2xl font-black mb-4 text-[#1D1D1F]">Ready to Pitch? 🚀</h3>
            <p className="text-[#6E6E73] leading-relaxed mb-6">
              เปลี่ยนทุกกิจกรรมให้เป็นการนำเสนอทางธุรกิจที่น่าทึ่ง 
              AI จะช่วยคุณวางแผนตั้งแต่ชื่อที่สะดุดตา จนไปถึงแผนการเงินและทีมงาน
            </p>
            <div className="flex items-center gap-4 text-cyan-600 font-bold text-sm">
              <span className="bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">Professional</span>
              <span className="bg-rose-50 px-3 py-1 rounded-full border border-rose-100 text-rose-500">Creative</span>
            </div>
          </div>
          <div className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white h-full min-h-[250px]">
             <img 
               src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000"
               alt="Pitching Session"
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
          </div>
        </motion.div>

        {/* Input Form Card */}
        <section className="bg-white rounded-[40px] border border-[#EBEBEB] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] mb-12">
          <div className="space-y-8">
            {/* Category selection */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#86868B] mb-4">
                <Layers className="w-4 h-4" /> หมวดหมู่กิจกรรม
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left ${
                        category === cat.id 
                        ? "bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-lg" 
                        : "bg-white border-[#EBEBEB] hover:border-cyan-400 group"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${category === cat.id ? "text-cyan-400" : "text-[#86868B] group-hover:text-cyan-500"}`} />
                      <div>
                        <div className="text-sm font-semibold">{cat.label}</div>
                        <div className={`text-[10px] uppercase font-bold tracking-widest ${category === cat.id ? "text-cyan-400 opacity-80" : "text-[#86868B]"}`}>{cat.labelCn}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Audience selection */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#86868B] mb-4">
                  <Target className="w-4 h-4" /> กลุ่มเป้าหมาย
                </label>
                <div className="space-y-2">
                  {AUDIENCES.map((aud) => {
                    const isSelected = audience.includes(aud.id);
                    return (
                      <div key={aud.id} className="space-y-2">
                        <button
                          onClick={() => {
                            setAudience(prev => 
                              isSelected 
                                ? prev.filter(id => id !== aud.id) 
                                : [...prev, aud.id]
                            );
                          }}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border transition-all ${
                            isSelected
                            ? "bg-cyan-50 border-cyan-200 text-cyan-900 shadow-sm"
                            : "bg-white border-[#EBEBEB] text-[#424245] hover:border-cyan-200 hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-cyan-500 border-cyan-500" : "bg-white border-[#D1D1D6]"}`}>
                              {isSelected && <BadgeCheck className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium">{aud.label}</span>
                          </div>
                          <span className="text-[10px] font-bold opacity-60">{aud.labelCn}</span>
                        </button>
                        
                        {aud.id === "other" && isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="px-2"
                          >
                            <input 
                              type="text"
                              placeholder="ระบุกลุ่มเป้าหมาย..."
                              value={customAudience}
                              onChange={(e) => setCustomAudience(e.target.value)}
                              className="w-full px-4 py-2 mt-2 rounded-lg border border-cyan-100 bg-cyan-50/50 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all"
                            />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#86868B] mb-4">
                  <TypeIcon className="w-4 h-4" /> คีย์เวิร์ด หรือ ธีม (ถ้ามี)
                </label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="เช่น จีนโบราณ, อวกาศ, Startup, รักษ์โลก..."
                  className="w-full h-[120px] p-4 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none placeholder:text-[#BBBBBB]"
                />
              </div>
            </div>

            {/* Budget Assistant Tool */}
            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#EBEBEB]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold">Budget Assistant (เครื่องมือช่วยคำนวณงบอาหาร)</h4>
                </div>
                <div className="group relative">
                  <AlertCircle className="w-4 h-4 text-[#86868B] cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#1D1D1F] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                    <p className="font-bold mb-1 underline">ระเบียบงบประมาณมหาวิทยาลัย:</p>
                    <ul className="space-y-1">
                      <li>• อาหารกลางวัน: 55 บาท/คน (เต็มวัน)</li>
                      <li>• อาหารว่าง: 25 บาท/คน (ครึ่งวัน)</li>
                      <li>• ค่าจ้างวิทยากร: 1,000 บาท/ชั่วโมง</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#86868B] uppercase mb-2">จำนวนผู้เข้าร่วม (คน)</label>
                  <input 
                    type="number"
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-[#EBEBEB] bg-white text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#86868B] uppercase mb-2">ระยะเวลากิจกรรม</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDuration("half")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${duration === "half" ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20" : "bg-white border-[#EBEBEB] text-[#86868B]"}`}
                    >
                      Half
                    </button>
                    <button 
                      onClick={() => setDuration("full")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${duration === "full" ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20" : "bg-white border-[#EBEBEB] text-[#86868B]"}`}
                    >
                      Full
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#86868B] uppercase mb-2">ชั่วโมงวิทยากร</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={speakerHours}
                      onChange={(e) => setSpeakerHours(parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 rounded-lg border border-[#EBEBEB] bg-white text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all"
                    />
                    <span className="text-xs text-[#86868B] font-bold">Hr</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-t border-[#EBEBEB] pt-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm">
                    <span className="text-[#86868B]">ประมาณการงบอาหาร: </span>
                    <span className="font-black text-[#1D1D1F]">
                      {duration === "full" ? (participants * 55).toLocaleString() : (participants * 25).toLocaleString()} THB
                    </span>
                  </div>
                  {speakerHours > 0 && (
                    <div className="text-sm">
                      <span className="text-[#86868B]">ประมาณการค่าวิทยากร: </span>
                      <span className="font-black text-[#1D1D1F]">
                        {(speakerHours * 1000).toLocaleString()} THB
                      </span>
                    </div>
                  )}
                  <div className="text-sm pt-1 mt-1 border-t border-dashed border-[#EBEBEB]">
                    <span className="text-[#86868B]">งบประมาณรวมเบื้องต้น: </span>
                    <span className="font-black text-amber-600">
                      {((duration === "full" ? participants * 55 : participants * 25) + (speakerHours * 1000)).toLocaleString()} THB
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-bold flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Food: 55 THB (Full), 25 THB (Half)
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                    <BadgeCheck className="w-3 h-3" />
                    Speaker: 1,000 THB / Hour
                  </div>
                </div>
              </div>
            </div>

            {/* Success Stories / Case Studies */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-12 h-1 bg-cyan-500 rounded-full" />
             <h3 className="text-xl font-black uppercase tracking-tight">Case Studies: จากไอเดียสู่ความสำเร็จ</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                name: "Street Food Pitching", 
                type: "Business", 
                img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400",
                budget: "55 THB x 30 = 1,650 THB",
                compliant: true
              },
              { 
                name: "Zen Brush Workshop", 
                type: "Culture", 
                img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
                budget: "25 THB x 20 = 500 THB",
                compliant: true
              },
              { 
                name: "LuxeMind Branding", 
                type: "Marketing", 
                img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400",
                budget: "2,000 THB (High Cost)",
                compliant: false
              },
            ].map((story, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden shadow-md border border-[#EBEBEB] flex flex-col"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src={story.img} alt={story.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-cyan-600">
                    {story.type}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-sm mb-1">{story.name}</h4>
                  <div className="mt-auto">
                    <div className="text-[10px] text-[#A1A1A6] mb-2">{story.budget}</div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${story.compliant ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {story.compliant ? <BadgeCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {story.compliant ? "Compliant" : "Requires Adjustment"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Action Group */}
            <div className="pt-4 flex flex-col items-center">
              <button
                onClick={generateIdea}
                disabled={loading}
                className={`group relative overflow-hidden flex items-center justify-center gap-3 px-10 py-5 rounded-full font-bold transition-all ${
                  loading 
                  ? "bg-[#F5F5F7] text-[#86868B] cursor-not-allowed" 
                  : "bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-[0_8px_30px_rgb(6,182,212,0.3)] shadow-lg"
                }`}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>กำลังสร้างสรรค์ไอเดีย...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>เริ่มระดมสมอง</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              
              <p className="mt-4 text-[10px] text-[#86868B] font-medium tracking-tight">AI จะช่วยคุณคิดไอเดียที่แตกต่างและทำได้จริงภายใต้บริบทของมหาวิทยาลัย</p>
            </div>
          </div>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Result Card */}
              <div id="result-card" className="bg-white rounded-[32px] border border-[#EBEBEB] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] group">
                <div className="bg-cyan-500 p-8 md:p-10 text-white relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black leading-tight max-w-[80%]">{result.name}</h2>
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      title="Copy to clipboard"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <CheckCircle2 className="w-6 h-6" />
                          </motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Copy className="w-6 h-6" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-5 h-px bg-white/40" />
                       <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Activity Concept</span>
                    </div>
                    <p className="text-xl font-medium leading-relaxed italic opacity-90">"{result.concept}"</p>
                  </div>
                </div>

                <div className="p-8 md:p-10 space-y-12 bg-white">
                  {/* Benefits Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">ประโยชน์ที่ได้รับ</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#F0F0F0]">
                          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">ผู้จัดงาน</p>
                          <p className="text-base text-[#424245] leading-relaxed">{result.benefits.organizer}</p>
                        </div>
                        <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#F0F0F0]">
                          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">ผู้เข้าร่วม</p>
                          <p className="text-base text-[#424245] leading-relaxed">{result.benefits.participant}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-10 md:pt-10">
                      <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#F0F0F0]">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">วิทยาลัยนานาชาติ (BUIC)</p>
                        <p className="text-base text-[#424245] leading-relaxed">{result.benefits.college}</p>
                      </div>
                      <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#F0F0F0]">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">มหาวิทยาลัยกรุงเทพ</p>
                        <p className="text-base text-[#424245] leading-relaxed">{result.benefits.university}</p>
                      </div>
                    </div>
                  </div>

                  {/* DNA & SDGs */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Star className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">BU DNA Alignment</h3>
                      </div>
                      <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100">
                        <p className="text-base text-amber-900 leading-relaxed font-normal">{result.dnaAlignment}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">SDGs Alignment</h3>
                      </div>
                      <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {result.sdgAlignment.goals.map((sdg, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold">{sdg}</span>
                          ))}
                        </div>
                        <p className="text-base text-emerald-900 leading-relaxed font-normal">{result.sdgAlignment.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="bg-[#FAFAFA] rounded-3xl p-8 border border-[#EBEBEB]">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">Action Plan (3-5 ขั้นตอน)</h3>
                    </div>
                    <div className="relative space-y-8">
                      <div className="absolute left-4 top-4 bottom-4 w-px bg-[#E0E0E0] z-0" />
                      {result.actionPlan.map((step, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex gap-6 relative z-10"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-white border-2 border-rose-200 text-rose-600 text-xs font-black flex items-center justify-center shadow-sm">
                            {idx + 1}
                          </div>
                          <div className="pt-1">
                             <p className="text-[#1D1D1F] font-medium leading-relaxed">{step}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Outcome */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                        <BadgeCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">Learning Outcomes (ELOs)</h3>
                    </div>
                    <div className="bg-cyan-50/20 p-6 rounded-2xl border border-cyan-100">
                      <p className="text-[#1D1D1F] leading-relaxed text-lg italic font-medium">"{result.expectedOutcome}"</p>
                    </div>
                  </div>

                  {/* Budget Section */}
                  <div className="bg-[#1D1D1F] rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6">
                      {(() => {
                        // Logic for Budget Compliance Tag (Feature 2)
                        const foodItems = result.budget.filter(b => 
                          b.item.toLowerCase().includes("อาหาร") || 
                          b.item.toLowerCase().includes("food") || 
                          b.item.toLowerCase().includes("snack") || 
                          b.item.toLowerCase().includes("ว่าง")
                        );
                        
                        const totalFoodBudget = foodItems.reduce((acc, curr) => {
                          const price = parseInt(curr.price.replace(/[^0-9]/g, "")) || 0;
                          return acc + price;
                        }, 0);
                        
                        const limit = duration === "full" ? participants * 55 : participants * 25;
                        const isCompliant = totalFoodBudget <= limit || foodItems.length === 0;

                        return (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md ${isCompliant ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                            {isCompliant ? <BadgeCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {isCompliant ? "✅ Compliant" : "⚠️ Requires Adjustment"}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-white/10 text-cyan-400 rounded-lg">
                        <Coins className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/70">งบประมาณที่ต้องการ (Estimate Budget)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-left">
                            <th className="pb-4 font-bold text-white/50 uppercase text-[10px] tracking-wider">รายการอุปกรณ์</th>
                            <th className="pb-4 font-bold text-white/50 uppercase text-[10px] tracking-wider text-right">ราคาประมาณ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.budget.map((b, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0">
                              <td className="py-3 text-white/90">{b.item}</td>
                              <td className="py-3 text-right font-mono text-cyan-400">{b.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Roles Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">ภาระหน้าที่การแบ่งงาน (Roles)</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(result.roles).map(([role, task]) => {
                        const roleNames: Record<string, string> = {
                          president: "ประธาน",
                          vicePresident: "รองประธาน",
                          secretary: "เลขานุการ",
                          treasurer: "เหรัญญิก",
                          pr: "ประชาสัมพันธ์",
                          recreation: "สันทนาการ",
                          academic: "วิชาการ",
                          welfare: "สวัสดิการ"
                        };
                        return (
                          <div key={role} className="p-4 rounded-xl border border-[#F0F0F0] hover:bg-indigo-50/30 transition-colors">
                            <div className="text-[10px] font-black text-indigo-500 uppercase mb-1 tracking-wider">{roleNames[role]}</div>
                            <p className="text-sm text-[#424245] leading-relaxed">{task}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coordination Section */}
                  <div className="bg-[#FAFAFA] rounded-3xl p-8 border border-[#EBEBEB]">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-[#1D1D1F] text-white rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">การประสานงานมหาวิทยาลัย</h3>
                    </div>
                    <div className="grid gap-4">
                      <div className="flex gap-4">
                        <div className="text-[10px] font-bold text-[#86868B] w-24 shrink-0 pt-1">ฝ่ายอาคารสถานที่</div>
                        <p className="text-base text-[#424245] leading-relaxed">{result.coordination.facilities}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-[10px] font-bold text-[#86868B] w-24 shrink-0 pt-1">ฝ่ายประชาสัมพันธ์</div>
                        <p className="text-base text-[#424245] leading-relaxed">{result.coordination.pr}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-[10px] font-bold text-[#86868B] w-24 shrink-0 pt-1">สาขาภาษาจีนธุรกิจ</div>
                        <p className="text-base text-[#424245] leading-relaxed">{result.coordination.businessChineseDept}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-white/50 backdrop-blur-sm rounded-[24px] p-6 border border-[#EBEBEB] flex items-start gap-4">
                <div className="mt-1 p-2 bg-cyan-50 text-cyan-600 rounded-full">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1">💡 Tips สำหรับการเขียนโครงการ</h4>
                  <p className="text-xs text-[#86868B] leading-relaxed">
                    คุณสามารถคัดลอกเนื้อหานี้ไปปรับใช้ในเอกสารโครงการได้ทันที อย่าลืมระบุงบประมาณที่เหมาะสมและทรัพยากรที่มีอยู่ในมหาวิทยาลัยเพื่อความชัดเจน
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Small Footer */}
      <footer className="max-w-3xl mx-auto px-6 pb-12 pt-8 text-center border-t border-[#F5F5F7]">
        <p className="text-[10px] text-[#BBBBBB] font-medium tracking-tight">
          © 2026 Creative Idea Hub | BU International Chinese Student Union | All Ideas AI-Assisted
        </p>
      </footer>
    </div>
  );
}
