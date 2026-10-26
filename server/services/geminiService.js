import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const hasGeminiKey = Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE');

let ai = null;
if (hasGeminiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('[GeminiService] Initialization error:', err.message);
  }
}

// -------------------------------------------------------------
// STAGE 1: Ground Truth & Suspects
// -------------------------------------------------------------
const STAGE_1_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    tagline: { type: Type.STRING },
    crimeSummary: { type: Type.STRING },
    murderWeaponOrMethod: { type: Type.STRING },
    solutionExplanation: { type: Type.STRING },
    criticalClueDescription: { type: Type.STRING },
    actualTimeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          event: { type: Type.STRING },
          involvedSuspects: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['time', 'event', 'involvedSuspects']
      }
    },
    suspects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tempId: { type: Type.STRING },
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          personality: { type: Type.STRING },
          statedAlibi: { type: Type.STRING },
          motive: { type: Type.STRING },
          isCulprit: { type: Type.BOOLEAN },
          secrets: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatTheyKnow: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatTheyLieAbout: { type: Type.ARRAY, items: { type: Type.STRING } },
          avatarPrompt: { type: Type.STRING }
        },
        required: [
          'tempId',
          'name',
          'role',
          'personality',
          'statedAlibi',
          'motive',
          'isCulprit',
          'whatTheyKnow',
          'whatTheyLieAbout',
          'avatarPrompt'
        ]
      }
    }
  },
  required: [
    'title',
    'tagline',
    'crimeSummary',
    'murderWeaponOrMethod',
    'solutionExplanation',
    'criticalClueDescription',
    'actualTimeline',
    'suspects'
  ]
};

export async function generateGroundTruth(scenarioSeed, difficulty = 'Detective') {
  if (hasGeminiKey && ai) {
    try {
      console.log(`[GeminiService] Generating Ground Truth for: "${scenarioSeed}"`);
      const systemInstruction = `You are the Master Architect of Mystery Games.
Construct a bulletproof, logically fair crime mystery based on the user's prompt.
CRITICAL FAIR-PLAY RULES:
1. Ronald Knox Golden Age Fair-Play: Detective has an equal chance with the reader of solving the problem. All clues must be plainly exhibited and produced.
2. The culprit MUST have a clear motive, opportunity, and means.
3. The culprit MUST have fabricated an alibi containing ONE definitive, logically provable contradiction that can be exposed by cross-referencing evidence.
4. Exactly one suspect must have isCulprit: true. 3 to 4 suspects total. At least 2 innocent suspects must have suspicious motives (red herrings) but solid alibis.
5. Difficulty setting: ${difficulty}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Scenario Seed: ${scenarioSeed}\nDifficulty: ${difficulty}`,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseJsonSchema: STAGE_1_SCHEMA
        }
      });

      const parsed = JSON.parse(response.text);
      return parsed;
    } catch (err) {
      console.warn('[GeminiService] Stage 1 API call failed, using procedural synthesis:', err.message);
    }
  }

  // Robust procedural fallback
  return generateProceduralGroundTruth(scenarioSeed, difficulty);
}

// -------------------------------------------------------------
// STAGE 2: Multi-Modal Evidence Synthesizer
// -------------------------------------------------------------
export async function generateEvidenceDossier(groundTruth, difficulty = 'Detective') {
  if (hasGeminiKey && ai) {
    try {
      console.log(`[GeminiService] Synthesizing Multi-Modal Evidence Dossier`);
      const prompt = `Based on this crime case:
Case Title: ${groundTruth.title}
Crime Summary: ${groundTruth.crimeSummary}
Murder Weapon/Method: ${groundTruth.murderWeaponOrMethod}
Critical Contradiction/Clue: ${groundTruth.criticalClueDescription}
Suspects: ${JSON.stringify(groundTruth.suspects.map(s => ({ name: s.name, role: s.role, alibi: s.statedAlibi, isCulprit: s.isCulprit })))}

Generate 4 to 5 distinct evidence items in JSON array format:
1. A 'whatsapp' digital chat thread between suspects, with timestamps, deleted message(s), and passive-aggressive tension.
2. A 'cctv' surveillance log with camera location, timestamps, transcript and frame descriptions that expose or verify movements.
3. A 'document' (Autopsy report, keycard access badge-in log, or financial transaction statement).
4. An 'image' physical evidence clue (e.g. shattered wristwatch, toxic vial, encrypted terminal).
5. Ensure the critical clue (${groundTruth.criticalClueDescription}) is embedded in one of these evidence items so the mystery is 100% solvable.

Output valid JSON matching this schema:
[
  {
    "title": "string",
    "type": "whatsapp" | "cctv" | "document" | "image",
    "category": "Forensics" | "Digital Log" | "Witness Statement" | "Surveillance",
    "description": "string",
    "significance": "Critical" | "Supporting" | "Distraction",
    "isRedHerring": boolean,
    "payload": { ... }
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      });

      const items = JSON.parse(response.text);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    } catch (err) {
      console.warn('[GeminiService] Stage 2 API call failed, using procedural synthesis:', err.message);
    }
  }

  return generateProceduralEvidence(groundTruth);
}

// -------------------------------------------------------------
// STAGE 3: Visual Evidence Generation
// -------------------------------------------------------------
export async function generateEvidenceVisual(promptText, visualType = 'scene') {
  if (hasGeminiKey && ai) {
    try {
      const polishedPrompt = `High quality, evidentiary noir photography, crime forensics documentary style: ${promptText}. Cinematic moody shadows, 8k textures, realistic lighting.`;
      const response = await ai.models.generateImages({
        model: 'gemini-3-pro-image',
        prompt: polishedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '4:3',
          outputMimeType: 'image/jpeg'
        }
      });

      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        const base64 = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64}`;
      }
    } catch (err) {
      // Fallback to Imagen or SVG graphics
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: `Forensic evidentiary photograph: ${promptText}`,
          config: { numberOfImages: 1 }
        });
        if (response?.generatedImages?.[0]?.image?.imageBytes) {
          return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
      } catch (imgErr) {
        // Continue to aesthetic SVG generator
      }
    }
  }

  // Generates high-fidelity noir/cyber-forensics stylized data URI
  return generateAestheticNoirSVG(promptText, visualType);
}

// -------------------------------------------------------------
// STAGE 4: Suspect Interrogation Dialogue
// -------------------------------------------------------------
export async function interrogateSuspectAI({ suspect, caseData, conversationHistory, playerMessage, presentedEvidence }) {
  let evidenceContext = '';
  if (presentedEvidence) {
    evidenceContext = `\nTHE DETECTIVE CONFRONTS YOU WITH PHYSICAL EVIDENCE:
Title: "${presentedEvidence.title}"
Type: ${presentedEvidence.type}
Details: ${presentedEvidence.description || JSON.stringify(presentedEvidence.payload)}`;
  }

  if (hasGeminiKey && ai) {
    try {
      const systemInstruction = `[SYSTEM: STRICT CHARACTER IMMERSION ROLEPLAY]
You are roleplaying as ${suspect.name}, a prime suspect in an ongoing criminal investigation.
YOUR OCCUPATION/ROLE: ${suspect.role}
YOUR PERSONALITY: ${suspect.personality}
YOUR STATED ALIBI: ${suspect.statedAlibi}
YOUR SECRET MOTIVE: ${suspect.motive}
ARE YOU THE CULPRIT: ${suspect.isCulprit ? 'YES' : 'NO'}

WHAT YOU KNOW AS TRUTH:
${Array.isArray(suspect.knowledgeBase?.whatTheyKnow) ? suspect.knowledgeBase.whatTheyKnow.join('\n- ') : 'Only your observed actions.'}

WHAT YOU ACTIVELY LIE ABOUT / COVER UP:
${Array.isArray(suspect.knowledgeBase?.whatTheyLieAbout) ? suspect.knowledgeBase.whatTheyLieAbout.join('\n- ') : 'None'}

CURRENT STRESS LEVEL: ${suspect.currentStressLevel || 20}/100

STRICT GUARDRAILS & RULES:
1. NEVER break character or acknowledge being an AI.
2. If asked directly "Did you kill them?", deny it convincingly according to your persona.
3. NEVER confess unless the detective presents specific evidence that undeniably contradicts your lie.
4. Keep responses concise and realistic (1 to 3 punchy sentences).
5. If the detective catches you in a contradiction or presents incriminating proof, increase stress visibly in your tone.

Return JSON in this format:
{
  "content": "Your spoken dialogue here",
  "stressDelta": -10 to +25 (integer change in stress),
  "cracked": boolean (true if you broke and confessed)
}`;

      const historyFormatted = conversationHistory.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const contents = [
        ...historyFormatted,
        {
          role: 'user',
          parts: [{ text: `${playerMessage}${evidenceContext}` }]
        }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text);
      return {
        content: parsed.content || "I have nothing to say to that.",
        stressDelta: typeof parsed.stressDelta === 'number' ? parsed.stressDelta : 5,
        cracked: Boolean(parsed.cracked)
      };
    } catch (err) {
      console.warn('[GeminiService] Interrogation API failed, using behavioral fallback:', err.message);
    }
  }

  // Procedural suspect response
  return generateProceduralInterrogation(suspect, playerMessage, presentedEvidence);
}

// -------------------------------------------------------------
// STAGE 5: Accusation Evaluation & Verdict Scoring
// -------------------------------------------------------------
export async function evaluateAccusation({ accusation, caseData, suspect, keyEvidence }) {
  const isCulpritTrue = Boolean(suspect && suspect.isCulprit);

  if (hasGeminiKey && ai) {
    try {
      const prompt = `You are the Supreme Magistrate and Master Detective evaluator.
Evaluate the detective's accusation against the case's Ground Truth:

CASE GROUND TRUTH:
- True Culprit: ${caseData.groundTruth?.culpritName || 'Unknown'} (ID: ${caseData.groundTruth?.culpritId})
- Actual Weapon/Method: ${caseData.groundTruth?.murderWeaponOrMethod}
- Critical Evidence: ${caseData.groundTruth?.criticalClueDescription} (ID: ${caseData.groundTruth?.criticalClueId})
- Solution Explanation: ${caseData.groundTruth?.solutionExplanation}

DETECTIVE'S ACCUSATION:
- Accused Suspect: ${suspect ? suspect.name : 'Unknown'} (Is Culprit? ${isCulpritTrue})
- Accused Motive: "${accusation.accusedMotive}"
- Accused Murder Method: "${accusation.murderMethod}"
- Key Evidence Cited: ${keyEvidence ? keyEvidence.title : 'None'}
- Deduction Argument: "${accusation.deductionStatement}"

EVALUATION RULES:
1. If isCulprit is FALSE, the max logicScore is 35 (wrong suspect).
2. If isCulprit is TRUE, score from 60 to 100 based on how well the motive, murder method, and key evidence expose the culprit's lie.
3. Assign a Detective Rank:
   - 90-100: "Master Sleuth"
   - 75-89: "Senior Inspector"
   - 50-74: "Inquisitive Detective"
   - 30-49: "Amateur Sleuth"
   - 0-29: "Baffled Constable"

Return valid JSON:
{
  "isCulpritCorrect": boolean,
  "logicScore": integer (0 to 100),
  "detectiveRank": string,
  "feedbackSummary": string,
  "groundTruthBreakdown": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text);
    } catch (err) {
      console.warn('[GeminiService] Verdict scoring API call failed:', err.message);
    }
  }

  // Procedural verdict logic
  let score = 20;
  let rank = 'Baffled Constable';
  let feedback = 'Your deduction failed to pin down the real culprit.';

  if (isCulpritTrue) {
    score = 75;
    if (accusation.deductionStatement && accusation.deductionStatement.length > 25) {
      score += 15;
    }
    if (keyEvidence && (keyEvidence.significance === 'Critical' || keyEvidence.isRedHerring === false)) {
      score += 8;
    }
    score = Math.min(score, 98);
    rank = score >= 90 ? 'Master Sleuth' : 'Senior Inspector';
    feedback = `Exceptional investigative work! You correctly identified ${suspect.name} and dismantled their fabricated alibi.`;
  } else {
    feedback = `Incorrect accusation. ${suspect ? suspect.name : 'The suspect'} was a red herring. They had a motive, but their alibi remains unbroken.`;
  }

  return {
    isCulpritCorrect: isCulpritTrue,
    logicScore: score,
    detectiveRank: rank,
    feedbackSummary: feedback,
    groundTruthBreakdown: caseData.groundTruth?.solutionExplanation || 'The actual crime timeline proved the true culprit was present during the fatal window.'
  };
}

// -------------------------------------------------------------
// PROCEDURAL FALLBACK GENERATORS (Ensures 100% Reliability)
// -------------------------------------------------------------
function generateProceduralGroundTruth(seed, difficulty) {
  const isFaradayTheme = seed.toLowerCase().includes('faraday') || seed.toLowerCase().includes('ceo') || seed.toLowerCase().includes('tech');
  
  if (isFaradayTheme) {
    return {
      title: "The Faraday Protocol",
      tagline: "Air-gapped and breathless.",
      crimeSummary: "David Kross, CEO of Aegis Cyber-Defense, was found dead inside the hermetically sealed, air-gapped Vault 4 conference room at 22:30. Cause of death was acute potassium chloride intoxication administered through a modified USB bypass probe.",
      murderWeaponOrMethod: "Modified USB hardware debugging probe delivering rapid neurotoxin via contact.",
      solutionExplanation: "Dr. Aris Thorne claimed he was compiling cryptographic test vectors in Lab B between 20:00 and 23:00. However, the corrupted CCTV frame timestamp reflects Thorne's signature silver cufflink at Vault 4 at 21:55, and Julian's deleted WhatsApp message mentions Thorne taking the master keycard just minutes prior.",
      criticalClueDescription: "Deleted WhatsApp message at 21:47 indicating master keycard handover, corroborated by CCTV reflection showing Dr. Thorne's distinctive silver cufflink.",
      actualTimeline: [
        { time: "20:00", event: "David Kross enters Vault 4 for classified audit.", involvedSuspects: ["David Kross"] },
        { time: "21:30", event: "Evelyn Vance reports cooling anomalies in server annex.", involvedSuspects: ["Evelyn Vance"] },
        { time: "21:45", event: "Julian Cole hands Master FOB to Dr. Thorne in corridor.", involvedSuspects: ["Julian Cole", "Dr. Aris Thorne"] },
        { time: "21:55", event: "Dr. Thorne enters Vault 4 and injects the toxin under guise of USB diagnostic.", involvedSuspects: ["Dr. Aris Thorne", "David Kross"] },
        { time: "22:15", event: "Marcus Brody sends warning not to access server rack.", involvedSuspects: ["Marcus Brody"] }
      ],
      suspects: [
        {
          tempId: "suspect-1",
          name: "Dr. Aris Thorne",
          role: "Chief Cryptographer & Hardware Architect",
          personality: "Arrogant, cold, calculating, prone to passive-aggressive intellectual condescension.",
          statedAlibi: "I was isolated in Cryptography Lab B compiling test vectors on an air-gapped rig between 20:00 and 23:00. Check the build scripts.",
          motive: "David Kross discovered Thorne was selling zero-day firmware bypasses to foreign venture syndicates.",
          isCulprit: true,
          secrets: [
            "Transferred $1.4M to an offshore Caymans shell corporation two days ago.",
            "Possesses custom soldering tools in his lab desk."
          ],
          whatTheyKnow: [
            "Vault 4's physical lock mechanism can be overridden with the Master FOB.",
            "David was planning to dismiss the entire hardware security team on Monday."
          ],
          whatTheyLieAbout: [
            "Denies ever leaving Lab B between 20:00 and 23:00.",
            "Denies possessing or handling the Master FOB that evening."
          ],
          avatarPrompt: "Distinguished 48-year-old male scientist, wire-rimmed glasses, sleek charcoal turtleneck, sharp calculating eyes."
        },
        {
          tempId: "suspect-2",
          name: "Evelyn Vance",
          role: "Senior Systems Admin & Infrastructure Lead",
          personality: "Nervous, workaholic, hyper-vigilant, chain-drinks espresso.",
          statedAlibi: "I was troubleshooting the cooling racks in Server Annex 2 all evening from 21:00 onwards.",
          motive: "David was threatening to fire her after a data leak exposed customer credentials last month.",
          isCulprit: false,
          secrets: [
            "Was illegally mining cryptocurrency on the secondary server farm during graveyard shift."
          ],
          whatTheyKnow: [
            "Noticed the cooling temperature spiked in Vault 4 at 21:50.",
            "Saw someone in a dark jacket heading toward Vault 4 corridor at 21:52."
          ],
          whatTheyLieAbout: [
            "Tries to hide why the cooling rack failed because it exposes her crypto mining rig."
          ],
          avatarPrompt: "Intense 34-year-old female engineer, disheveled dark hair tied in a bun, headset around neck, exhausted amber eyes."
        },
        {
          tempId: "suspect-3",
          name: "Julian Cole",
          role: "Lead Firmware Security Analyst",
          personality: "Defensive, quick to shift blame, anxious when confronted with logs.",
          statedAlibi: "I clocked out at 21:15 and went to the diner across the street. I have the receipt.",
          motive: "David passed him over for CTO promotion twice in favor of outside consultants.",
          isCulprit: false,
          secrets: [
            "Borrowed the Master FOB from Marcus without authorization at 21:00.",
            "Deleted a panicked WhatsApp message when police arrived."
          ],
          whatTheyKnow: [
            "He handed the Master FOB to Dr. Thorne at 21:45 because Thorne claimed David urgently requested it.",
            "The diner receipt was from a takeout order his girlfriend picked up."
          ],
          whatTheyLieAbout: [
            "Lies about when he actually left the campus to avoid admitting he gave Thorne the keycard."
          ],
          avatarPrompt: "Sharp 29-year-old male analyst, tailored navy button-down shirt, athletic build, nervous posture."
        },
        {
          tempId: "suspect-4",
          name: "Marcus Brody",
          role: "Chief of Physical Security",
          personality: "Gruff ex-military, rigid, procedural, fiercely defensive of his security protocols.",
          statedAlibi: "On perimeter watch in the central monitoring control hub all night.",
          motive: "David was privatizing security and terminating Brody's pension plan.",
          isCulprit: false,
          secrets: [
            "Fell asleep for 20 minutes between 21:40 and 22:00 during his patrol cycle."
          ],
          whatTheyKnow: [
            "Camera 04 in the North Corridor has a known 2-minute blind spot near Vault 4.",
            "Dr. Thorne's silver cufflink was spotted on the secondary corridor mirror."
          ],
          whatTheyLieAbout: [
            "Claims he monitored CCTV without blinking to cover up his nap."
          ],
          avatarPrompt: "Burly 52-year-old security chief, military crew cut, weathered jawline, black tactical security uniform."
        }
      ]
    };
  }

  // Generic procedural murder mystery
  return {
    title: "Shadows at the Obsidian Manor",
    tagline: "Greed leaves a venomous trail.",
    crimeSummary: `An unexpected fatality occurred under enigmatic circumstances following: "${seed}". The primary victim was poisoned during a private conference.`,
    murderWeaponOrMethod: "Curare derivative dissolved in evening vintage wine.",
    solutionExplanation: "The killer claimed to have been in the library, but the wine cellar badge logs and timestamped chat transcript expose that they prepared the vintage carafe at 21:40.",
    criticalClueDescription: "Cellar temperature and badge access log showing entry at 21:40 contradicting the library alibi.",
    actualTimeline: [
      { time: "20:30", event: "Guests gather in the main reception hall.", involvedSuspects: ["Victim", "Suspects"] },
      { time: "21:30", event: "Power flickers across the west wing.", involvedSuspects: ["Butler"] },
      { time: "21:40", event: "Poison introduced into private decanter in cellar.", involvedSuspects: ["True Culprit"] },
      { time: "22:15", event: "Victim collapses after proposing final toast.", involvedSuspects: ["Victim"] }
    ],
    suspects: [
      {
        tempId: "suspect-1",
        name: "Arthur Sterling",
        role: "Financial Trustee & Family Attorney",
        personality: "Polished, condescending, smooth-talking, fiercely guarded.",
        statedAlibi: "Reviewing the estate deed in the East Library from 21:00 to 22:00 undisturbed.",
        motive: "Embezzled $3.2M from the estate fund that the victim was about to audit in the morning.",
        isCulprit: true,
        secrets: ["Forged signature on the latest estate amendment."],
        whatTheyKnow: ["The vintage 1982 decanter was reserved exclusively for the victim."],
        whatTheyLieAbout: ["Claims he never set foot near the cellar or butler's pantry."],
        avatarPrompt: "Elegantly dressed 55-year-old attorney with silver temple hair, pocket square, manicured hands."
      },
      {
        tempId: "suspect-2",
        name: "Lady Genevieve Vance",
        role: "Heiress & Business Partner",
        personality: "Melodramatic, sharp-tongued, observant, prone to venomous wit.",
        statedAlibi: "Taking fresh air on the veranda overlooking the lower gardens.",
        motive: "The victim threatened to cut her voting shares in the joint holding company.",
        isCulprit: false,
        secrets: ["Heavy gambling debts with a Riviera casino syndicate."],
        whatTheyKnow: ["Saw someone hurrying toward the pantry with a leather briefcase at 21:38."],
        whatTheyLieAbout: ["Lies about why her jewelry was found in the study safe."],
        avatarPrompt: "Striking 38-year-old socialite in emerald silk dress, diamond choker, disdainful gaze."
      },
      {
        tempId: "suspect-3",
        name: "Gideon Cross",
        role: "Head Sommelier & Private Butler",
        personality: "Fastidious, quiet, observing everything, deeply resentful of condescension.",
        statedAlibi: "In the kitchen supervising the dessert pastry chef.",
        motive: "The victim publicly humiliated him and accused him of stealing rare vintages.",
        isCulprit: false,
        secrets: ["Was secretly tasting and decanting private collection wines without permission."],
        whatTheyKnow: ["The cellar key was missing from its hook between 21:35 and 21:50."],
        whatTheyLieAbout: ["Claims the cellar key never left his pocket."],
        avatarPrompt: "Immaculate 46-year-old butler with austere posture, dark livery suit, observant eyes."
      }
    ]
  };
}

function generateProceduralEvidence(groundTruth) {
  const isFaraday = groundTruth.title.includes('Faraday');

  if (isFaraday) {
    return [
      {
        title: "Alpha Dev Team - Leaked WhatsApp Export",
        type: "whatsapp",
        category: "Digital Log",
        description: "Encrypted internal WhatsApp group chat export recovered from Julian Cole's smartphone.",
        significance: "Critical",
        isRedHerring: false,
        payload: {
          chatGroupTitle: "Vault 4 Core Ops [Classified]",
          participants: ["Evelyn Vance", "Julian Cole", "Marcus Brody", "Dr. Aris Thorne"],
          messages: [
            { sender: "Evelyn Vance", timestamp: "21:38", content: "Rack 3 cooling fan is tripping again. Who is running heavy compute?", isDeleted: false },
            { sender: "Julian Cole", timestamp: "21:42", content: "I am logging off. Got a migraine. Going across to the diner.", isDeleted: false },
            { sender: "Dr. Aris Thorne", timestamp: "21:44", content: "Julian, bring the Master FOB to the corridor before you vanish.", isDeleted: false },
            { sender: "Julian Cole", timestamp: "21:46", content: "Gave it to you by the water cooler. Don't lose it.", isDeleted: false },
            { sender: "Julian Cole", timestamp: "21:47", content: "This message was deleted by sender", isDeleted: true },
            { sender: "Marcus Brody", timestamp: "22:05", content: "All badges need to be back in the dock by 22:30. No exceptions.", isDeleted: false },
            { sender: "Dr. Aris Thorne", timestamp: "22:20", content: "Understood Marcus. Returning to my lab now.", isDeleted: false }
          ]
        }
      },
      {
        title: "North Corridor Surveillance - CAM 04 Log & Frame",
        type: "cctv",
        category: "Surveillance",
        description: "Motion-activated surveillance camera feed covering the approach to Vault 4.",
        significance: "Critical",
        isRedHerring: false,
        payload: {
          cameraLocation: "Vault 4 Approach - North Corridor Cam 04",
          timeWindow: "21:45 - 22:15",
          videoTranscript: "[21:51:02] Motion detected. A figure wearing an Aegis charcoal lab turtleneck steps into frame. Subject approaches Vault 4 keycard panel. At [21:55:18], the subject reaches for the handle; the convex security mirror reflects a distinctive silver hexagonal cufflink matching Dr. Thorne's cryptographic award emblem.",
          frames: [
            {
              timestamp: "21:55:18",
              imageUrl: generateAestheticNoirSVG("CCTV Cam 04 - Vault 4 Entrance Corridor", "cctv"),
              description: "Frame #841: Subject inserting keycard into Vault 4 terminal. Silver cufflink visible in reflection."
            },
            {
              timestamp: "22:08:44",
              imageUrl: generateAestheticNoirSVG("CCTV Cam 04 - Rapid Exit Motion", "cctv"),
              description: "Frame #912: Same figure swiftly exiting corridor toward Lab Annex B."
            }
          ]
        }
      },
      {
        title: "Coroner Preliminary Forensic Autopsy",
        type: "document",
        category: "Forensics",
        description: "Official preliminary post-mortem toxicology and pathology assessment of David Kross.",
        significance: "Supporting",
        isRedHerring: false,
        payload: {
          documentType: "Autopsy Report",
          bodyContent: "Subject: David Kross (Age: 51). Time of death estimated at 22:00 (+/- 15 mins). No blunt force trauma or asphyxiation marks. Microscopic puncture wound discovered at the base of the left index finger, consistent with an electrified USB pin probe. Rapid ventricular fibrillation induced via concentrated chemical agent.",
          metadataTable: {
            "Case File": "CR-2026-9041-A",
            "Pathologist": "Dr. Miriam O'Connor, ME",
            "Estimated TOD": "21:55 - 22:10",
            "Tox Screen": "Positive: Concentrated KCl & Synthetic Neuro-blocker",
            "Classification": "Homicide"
          }
        }
      },
      {
        title: "Faraday Vault 4 Badge Access Register",
        type: "document",
        category: "Digital Log",
        description: "Air-gapped magnetic latch access timestamps exported directly from Vault 4 door controller.",
        significance: "Critical",
        isRedHerring: false,
        payload: {
          documentType: "Keycard Access Audit",
          bodyContent: "Controller offline memory buffer dump. Physical badges read at outer portal:",
          metadataTable: {
            "20:00:14": "Badge #001 (David Kross - OWNER)",
            "21:54:50": "Badge #MASTER-09 (Julian Cole - Transferred)",
            "22:09:12": "Door Sensor: Emergency Seal Engaged",
            "22:31:04": "Badge #SEC-02 (Marcus Brody - First Responder)"
          }
        }
      },
      {
        title: "Crime Scene Overview - Vault 4 Conference Table",
        type: "image",
        category: "Forensics",
        description: "Crime scene photography showing David Kross slumped over the encrypted terminal with open laptop.",
        significance: "Supporting",
        isRedHerring: false,
        payload: {
          imageUrl: generateAestheticNoirSVG("Crime scene overview inside Vault 4 with victim slumped at conference table", "scene"),
          forensicNotes: "Victim was seated before an air-gapped terminal. A custom black USB debugging cable remains plugged into port 2. Coffee mug untouched."
        }
      }
    ];
  }

  // Default procedural evidence
  return [
    {
      title: "Estate Staff SMS & WhatsApp Export",
      type: "whatsapp",
      category: "Digital Log",
      description: "Chat transcripts from the estate internal coordination group.",
      significance: "Critical",
      isRedHerring: false,
      payload: {
        chatGroupTitle: "Estate Operations",
        participants: ["Arthur Sterling", "Lady Genevieve", "Gideon Cross"],
        messages: [
          { sender: "Lady Genevieve", timestamp: "21:15", content: "The decanter is on the sideboard. Don't touch it.", isDeleted: false },
          { sender: "Arthur Sterling", timestamp: "21:35", content: "I need the cellar key for the audit papers.", isDeleted: false },
          { sender: "Arthur Sterling", timestamp: "21:42", content: "This message was deleted", isDeleted: true },
          { sender: "Gideon Cross", timestamp: "21:55", content: "Serving the private vintage now.", isDeleted: false }
        ]
      }
    },
    {
      title: "Cellar Environmental & Access Log",
      type: "document",
      category: "Digital Log",
      description: "Automated climate and electronic deadbolt logs from the private vintage cellar.",
      significance: "Critical",
      isRedHerring: false,
      payload: {
        documentType: "Security Audit Log",
        bodyContent: "Automated door sensor recordings for private cellar door.",
        metadataTable: {
          "21:38:10": "Electronic Lock: Opened via Keycard #ATTY-01",
          "21:43:05": "Cellar Door Closed & Latched",
          "22:10:00": "Emergency Dispatch Triggered"
        }
      }
    },
    {
      title: "Forensic Toxicology Certificate",
      type: "document",
      category: "Forensics",
      description: "Official chemical breakdown of residue recovered from the crystal vintage goblet.",
      significance: "Supporting",
      isRedHerring: false,
      payload: {
        documentType: "Toxicology Report",
        bodyContent: "Residue found on the rim and stem of goblet #1 contains curare alkaloids and synthetic cardiac inhibitors.",
        metadataTable: {
          "Lethal Dose": "Reached in approx. 8 minutes",
          "Vehicle": "Red Wine (Tannin mask)",
          "Status": "Homicide"
        }
      }
    },
    {
      title: "Grand Hallway Surveillance Still",
      type: "cctv",
      category: "Surveillance",
      description: "Corridor footage capturing movement toward the cellar stairs.",
      significance: "Supporting",
      isRedHerring: false,
      payload: {
        cameraLocation: "West Wing Gallery - Cam 02",
        timeWindow: "21:30 - 22:00",
        videoTranscript: "Figure in dark formal tailcoat descends cellar staircase at 21:37 carrying an opaque leather folder.",
        frames: [
          {
            timestamp: "21:37:44",
            imageUrl: generateAestheticNoirSVG("Cellar staircase security capture", "cctv"),
            description: "Frame #419: Figure entering cellar door under low amber lighting."
          }
        ]
      }
    }
  ];
}

function generateProceduralInterrogation(suspect, playerMessage, presentedEvidence) {
  const msg = playerMessage.toLowerCase();
  let content = '';
  let stressDelta = 5;
  let cracked = false;

  if (suspect.isCulprit) {
    if (presentedEvidence && (presentedEvidence.title.includes('WhatsApp') || presentedEvidence.title.includes('CCTV') || presentedEvidence.title.includes('Badge') || presentedEvidence.title.includes('Cellar'))) {
      stressDelta = 25;
      suspect.currentStressLevel = Math.min(100, (suspect.currentStressLevel || 20) + 25);
      if (suspect.currentStressLevel >= 75) {
        cracked = true;
        content = `...Damn it. Fine! You think you're clever with those logs? Kross was going to destroy everything I spent twenty years building! He didn't understand the risks!`;
      } else {
        content = `Wait... where did you obtain those logs? That timestamp is... there's an obvious synchronization lag on that server! You can't pin this on me!`;
      }
    } else if (msg.includes('kill') || msg.includes('murder') || msg.includes('poison')) {
      stressDelta = 12;
      content = `Are you out of your mind, Detective? I am an architect of systems, not an executioner. Check my alibi and stop wasting precious time.`;
    } else if (msg.includes('alibi') || msg.includes('where were you')) {
      content = `As I've already stated clearly: ${suspect.statedAlibi}. Why don't you examine the logs yourself instead of throwing baseless accusations?`;
    } else {
      content = `I have cooperated fully with this inquiry. If you have legitimate forensic evidence against me, produce it. Otherwise, let me return to my work.`;
    }
  } else {
    // Innocent suspect
    if (presentedEvidence) {
      stressDelta = 8;
      content = `Look at that closely, Detective! That doesn't show me committing any crime. If anything, it backs up what I've been saying from the very beginning.`;
    } else if (msg.includes('kill') || msg.includes('murder')) {
      stressDelta = 10;
      content = `How dare you! I had my differences with the victim, sure, but I would never take a human life. You are interrogating the wrong person!`;
    } else if (msg.includes('alibi') || msg.includes('where were you')) {
      content = `I was right where I said: ${suspect.statedAlibi}. Several people can corroborate that if you take the trouble to check.`;
    } else {
      content = `I am telling you the complete truth. Look into the others—someone here was acting deeply suspicious right before the incident occurred.`;
    }
  }

  return { content, stressDelta, cracked };
}

// Generates high quality stylized SVG visuals (Noir/forensics aesthetic)
function generateAestheticNoirSVG(caption, type) {
  let innerArt = '';
  const cleanCaption = caption.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 48);

  if (type === 'cctv') {
    innerArt = `
      <rect width="600" height="400" fill="#090d16" />
      <line x1="0" y1="50" x2="600" y2="50" stroke="#06b6d4" stroke-opacity="0.15" stroke-dasharray="4,4" />
      <line x1="0" y1="150" x2="600" y2="150" stroke="#06b6d4" stroke-opacity="0.15" stroke-dasharray="4,4" />
      <line x1="0" y1="250" x2="600" y2="250" stroke="#06b6d4" stroke-opacity="0.15" stroke-dasharray="4,4" />
      <line x1="0" y1="350" x2="600" y2="350" stroke="#06b6d4" stroke-opacity="0.15" stroke-dasharray="4,4" />
      <!-- Perspective Hallway Corridor -->
      <polygon points="120,40 480,40 400,140 200,140" fill="#111827" stroke="#1f2937" />
      <polygon points="200,140 400,140 360,260 240,260" fill="#161e2e" stroke="#374151" />
      <rect x="270" y="160" width="60" height="95" fill="#0f172a" stroke="#06b6d4" stroke-width="1.5" />
      <!-- Shadow Silhouette of Suspect -->
      <circle cx="300" cy="185" r="14" fill="#030712" />
      <path d="M 285 202 Q 300 198 315 202 L 322 255 L 278 255 Z" fill="#030712" />
      <!-- Cufflink Glint Point -->
      <circle cx="288" cy="230" r="3.5" fill="#38bdf8" filter="drop-shadow(0 0 4px #06b6d4)" />
      <!-- CCTV HUD Overlay -->
      <rect x="20" y="20" width="12" height="12" fill="#ef4444" />
      <text x="40" y="31" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">REC ●</text>
      <text x="580" y="31" text-anchor="end" fill="#06b6d4" font-family="monospace" font-size="12">[CAM 04 - NORTH VAULT]</text>
      <text x="25" y="380" fill="#f59e0b" font-family="monospace" font-size="13">2026-10-26 21:55:18 UTC</text>
      <text x="575" y="380" text-anchor="end" fill="#9ca3af" font-family="monospace" font-size="11">MOTION LOCK: 94.2%</text>
    `;
  } else if (type === 'scene') {
    innerArt = `
      <rect width="600" height="400" fill="#0a0e17" />
      <defs>
        <radialGradient id="lampGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#0a0e17" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="600" height="400" fill="url(#lampGlow)" />
      <!-- Conference table & terminal -->
      <polygon points="80,260 520,260 560,370 40,370" fill="#1e293b" stroke="#334155" stroke-width="2" />
      <rect x="220" y="190" width="160" height="100" rx="4" fill="#0f172a" stroke="#06b6d4" stroke-width="2" />
      <rect x="235" y="200" width="130" height="70" fill="#020617" />
      <text x="250" y="235" fill="#ef4444" font-family="monospace" font-size="10">SECURITY LOCKOUT</text>
      <!-- Slumped silhouette -->
      <path d="M 330 250 Q 380 230 420 280 L 460 360 L 320 360 Z" fill="#030712" />
      <!-- Evidence marker flag -->
      <polygon points="170,250 190,250 190,270 170,270" fill="#f59e0b" />
      <text x="180" y="265" text-anchor="middle" fill="#000" font-family="sans-serif" font-size="12" font-weight="bold">#1</text>
      <!-- HUD Title -->
      <text x="25" y="30" fill="#f59e0b" font-family="monospace" font-size="13">CRIME SCENE FORENSIC EVIDENCE</text>
      <text x="25" y="50" fill="#64748b" font-family="monospace" font-size="11">AIR-GAPPED VAULT 4 // CASE #2026-9041</text>
      <text x="25" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12">${cleanCaption}</text>
    `;
  } else {
    // Suspect portrait
    innerArt = `
      <rect width="600" height="400" fill="#0b0f19" />
      <circle cx="300" cy="160" r="65" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <path d="M 200 360 C 200 260 400 260 400 360 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <!-- Noir lighting bar -->
      <rect x="0" y="140" width="600" height="30" fill="#f59e0b" fill-opacity="0.12" />
      <!-- HUD stamp -->
      <rect x="30" y="30" width="110" height="24" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" />
      <text x="85" y="46" text-anchor="middle" fill="#ef4444" font-family="monospace" font-size="11" font-weight="bold">CONFIDENTIAL</text>
      <text x="300" y="380" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="13">${cleanCaption}</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">${innerArt}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

