
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getEncouragement(status: 'start' | 'win' | 'lose' | 'hint'): Promise<string> {
  const prompt = {
    start: "作为一个专业的扫雷导师，用一句话热情地鼓励小朋友开始扫雷游戏，把扫雷描述成一场'寻找宝藏并排除危险地雷'的趣味冒险。",
    win: "小朋友成功找出了所有地雷并赢得了胜利！用充满夸奖和童心的一句话祝贺他，夸他像小英雄一样聪明。",
    lose: "小朋友不小心碰到了地雷，游戏失败了。用非常温柔、宽慰的一句话鼓励他不要灰心，告诉他伟大的探险家也会有失误，再试一次就好。",
    hint: "小朋友正在思考。给他一句关于扫雷逻辑的小提示，比如'看看方块上的数字，它告诉你周围有多少个地雷'，语气要像智慧的导师。"
  }[status];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 60,
        temperature: 0.8,
      }
    });
    return response.text || "加油哦，小英雄！相信你的智慧！";
  } catch (error) {
    console.error("AI Encouragement failed:", error);
    return "每一次点击都是智慧的体现，加油！";
  }
}
