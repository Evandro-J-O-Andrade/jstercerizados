import type {
  MatchResult,
  MatchReason,
  MatchBreakdownItem,
  MatchingCandidate,
  JobWithSkills,
} from '@/types/domain/matching';
import { MATCH_WEIGHTS, ALGORITHM_VERSION } from '@/types/domain/matching';

function normalizeText(text: string | null | undefined): string {
  return (text ?? '').toLowerCase().trim();
}

function tokenize(text: string | null | undefined): string[] {
  return normalizeText(text).split(/[\s,.-]+/).filter((t) => t.length >= 3);
}

function overlapRatio(a: string[], b: string[]): number {
  if (b.length === 0) return 0;
  const aSet = new Set(a.map((t) => t.toLowerCase()));
  let hits = 0;
  for (const token of b) {
    if (aSet.has(token.toLowerCase())) hits++;
  }
  return hits / b.length;
}

function calculateYears(experiences: MatchingCandidate['experiences']): number {
  let total = 0;
  const now = new Date();
  for (const exp of experiences) {
    if (!exp.start_date) continue;
    const start = new Date(exp.start_date);
    const end = exp.end_date ? new Date(exp.end_date) : now;
    if (isNaN(start.getTime())) continue;
    const diffMs = Math.max(end.getTime() - start.getTime(), 0);
    total += Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.5));
  }
  return total;
}

const LEVEL_RANK: Record<string, number> = {
  beginner: 1,
  basic: 1,
  intermediate: 2,
  pleno: 2,
  mid: 2,
  advanced: 3,
  senior: 3,
  expert: 4,
  master: 4,
};

function rankLevel(level: string | null | undefined): number {
  if (!level) return 0;
  return LEVEL_RANK[level.toLowerCase()] ?? 0;
}

export function matchJobToCandidate(
  candidate: MatchingCandidate,
  job: JobWithSkills,
): MatchResult {
  const breakdown: MatchBreakdownItem[] = [];
  const reasons: MatchReason[] = [];
  let totalWeighted = 0;
  let totalWeight = 0;

  const w = MATCH_WEIGHTS;

  // ── 1. Cargo / Área de Interesse (25%) ──
  {
    const jobTokens = tokenize(job.title);
    const experienceTokens: string[] = [];
    for (const exp of candidate.experiences) {
      experienceTokens.push(...tokenize(exp.position));
    }
    if (candidate.headline) experienceTokens.push(...tokenize(candidate.headline));

    let titleScore = 0;

    if (jobTokens.length > 0 && experienceTokens.length > 0) {
      const ratio = overlapRatio(experienceTokens, jobTokens);
      titleScore = ratio;
    }

    if (job.seniority) {
      const seniorityMatch =
        normalizeText(job.seniority) ===
        normalizeText(candidate.experiences[0]?.position?.split(' ').pop());
      if (seniorityMatch) titleScore = Math.min(titleScore + 0.2, 1);
    }

    const titlePct = Math.round(titleScore * w.job_title);
    totalWeighted += titlePct;
    totalWeight += w.job_title;

    const matched = titleScore > 0;
    breakdown.push({
      label: 'Cargo / área de interesse',
      weight: w.job_title,
      score: titlePct,
      maxScore: w.job_title,
      percentage: Math.round(titleScore * 100),
      matched,
      details: matched
        ? `Experiência alinhada com "${job.title}"`
        : 'Sem experiência diretamente relacionada ao cargo',
    });
     reasons.push({
      criterion: 'Cargo / área de interesse',
      matched,
      weight: w.job_title,
      details: matched
        ? `Você possui experiência relacionada a "${job.title}"`
        : 'Nenhuma experiência com cargo ou área semelhante',
    });
  }

  // ── 2. Experiência Profissional (20%) ──
  {
    const candidateYears = calculateYears(candidate.experiences);
    let expScore = 0;
    let detail = '';

    if (candidate.experiences.length > 0) {
      const relevantExps = candidate.experiences.filter((e) => {
        const posTokens = tokenize(e.position);
        const jobTokens = tokenize(job.title);
        return overlapRatio(posTokens, jobTokens) > 0;
      });

      if (relevantExps.length > 0) {
        expScore += 0.4;
        detail += ` ${relevantExps.length} experiência(s) relevante(s)`;
      }

      if (candidateYears > 0) {
        const yearsScore = Math.min(candidateYears / 3, 1);
        expScore += yearsScore * 0.6;
        detail += `, ${candidateYears} ano(s) de experiência total`;
      }
    }

    expScore = Math.min(expScore, 1);
    const expPct = Math.round(expScore * w.experience);
    totalWeighted += expPct;
    totalWeight += w.experience;

    breakdown.push({
      label: 'Experiência profissional',
      weight: w.experience,
      score: expPct,
      maxScore: w.experience,
      percentage: Math.round(expScore * 100),
      matched: expScore > 0,
      details: detail || 'Sem experiência profissional registrada',
    });
    reasons.push({
      criterion: 'Experiência profissional',
      matched: expScore > 0,
      weight: w.experience,
      details: detail || 'Nenhuma experiência profissional registrada',
    });
  }

  // ── 3. Skills / Competências (20%) ──
  {
    const jobSkills = job.skills || [];
    let skillScore = 0;
    let detail = '';

    if (jobSkills.length > 0 && candidate.skills.length > 0) {
      const candidateSkillIds = new Set(
        candidate.skills.map((s) => s.skill_id),
      );
      const candidateSkillNames = candidate.skills
        .filter((s) => s.level)
        .map((s) => ({
          level: s.level ?? '',
          years_used: s.years_used ?? 0,
        }));

      const requiredSkills = jobSkills.filter((js) => js.required);
      const optionalSkills = jobSkills.filter((js) => !js.required);

      let requiredHits = 0;
      let optionalHits = 0;
      const matchedSkills: string[] = [];

      for (const js of requiredSkills) {
        if (candidateSkillIds.has(js.skill_id) || (js.skill_name && candidateSkillIds.has(js.skill_name.toLowerCase()))) {
          requiredHits++;
          matchedSkills.push(js.skill_name || js.skill_id);
        }
      }

      for (const js of optionalSkills) {
        if (candidateSkillIds.has(js.skill_id) || (js.skill_name && candidateSkillIds.has(js.skill_name.toLowerCase()))) {
          optionalHits++;
          matchedSkills.push(js.skill_name || js.skill_id);
        }
      }

      if (requiredHits > 0) {
        skillScore += (requiredHits / Math.max(requiredSkills.length, 1)) * 0.7;
        detail += ` ${requiredHits} skill(s) obrigatória(s)`;
      }
      if (optionalHits > 0) {
        skillScore += (optionalHits / Math.max(optionalSkills.length, 1)) * 0.3;
        detail += `, ${optionalHits} skill(s) desejável(e)s`;
      }

      // Proficiency bonus: if candidate's level >= required level
      const profBonus = Math.min(
        candidateSkillNames.filter((s) => rankLevel(s.level) >= 2).length /
          Math.max(jobSkills.length, 1),
        0.2,
      );
      skillScore = Math.min(skillScore + profBonus, 1);

      detail += matchedSkills.length > 0 ? `, ${matchedSkills.join(', ')}` : '';
    }

    const skillPct = Math.round(skillScore * w.skills);
    totalWeighted += skillPct;
    totalWeight += w.skills;

    const matched = skillScore > 0;
    breakdown.push({
      label: 'Skills / competências',
      weight: w.skills,
      score: skillPct,
      maxScore: w.skills,
      percentage: Math.round(skillScore * 100),
      matched,
      details: matched
        ? `Skills alinhadas: ${detail}`
        : 'Nenhuma skill correspondente',
    });
    reasons.push({
      criterion: 'Skills / competências',
      matched,
      weight: w.skills,
      details: matched ? `Skills alinhadas${detail}` : 'Nenhuma skill correspondente',
    });
  }

  // ── 4. Formação (10%) ──
  {
    let eduScore = 0;
    let detail = '';

    if (candidate.education.length > 0) {
      const jobTokens = tokenize(job.title);
      const jobReqTokens = tokenize(
        ((job.metadata ?? {}) as Record<string, unknown>).requirements as
          | string
          | null
          | undefined,
      );

      let eduMatches = 0;
      for (const edu of candidate.education) {
        const courseTokens = tokenize(edu.course);
        const instTokens = tokenize(edu.institution);
        const allTokens = [...courseTokens, ...instTokens];

        if (overlapRatio(allTokens, jobTokens) > 0.3) {
          eduMatches++;
          detail += ` ${edu.course || edu.institution}`;
        }
        if (overlapRatio(allTokens, jobReqTokens) > 0.3) {
          eduMatches++;
        }
      }

      if (eduMatches > 0) {
        eduScore = Math.min(eduMatches / 2, 1);
      } else {
        eduScore = 0.3;
        detail = 'Formação registrada, mas não diretamente ligada ao cargo';
      }
    }

    const eduPct = Math.round(eduScore * w.education);
    totalWeighted += eduPct;
    totalWeight += w.education;

    breakdown.push({
      label: 'Formação',
      weight: w.education,
      score: eduPct,
      maxScore: w.education,
      percentage: Math.round(eduScore * 100),
      matched: eduScore > 0,
      details: detail || 'Sem formação registrada',
    });
    reasons.push({
      criterion: 'Formação',
      matched: eduScore > 0,
      weight: w.education,
      details: detail || 'Nenhuma formação registrada',
    });
  }

  // ── 5. Localização (10%) ──
  {
    let locScore = 0;
    let detail = '';

    const jobLocation = [job.city, job.state].filter(Boolean).join(', ');

    if (candidate.locations && candidate.locations.length > 0) {
      const jobLocTokens = tokenize(jobLocation);
      for (const prefLoc of candidate.locations) {
        const prefTokens = tokenize(prefLoc);
        if (overlapRatio(prefTokens, jobLocTokens) > 0.5) {
          locScore = 1;
          detail = `Localização "${prefLoc}" corresponde à vaga`;
          break;
        }
        if (
          normalizeText(prefLoc) === normalizeText(job.city) ||
          normalizeText(prefLoc) === normalizeText(job.state) ||
          normalizeText(prefLoc) === normalizeText(jobLocation)
        ) {
          locScore = 1;
          detail = `Localização "${prefLoc}" corresponde à vaga`;
          break;
        }
      }
    } else {
      locScore = 0.5;
      detail = 'Localização indefinida nas preferências';
    }

    const locPct = Math.round(locScore * w.location);
    totalWeighted += locPct;
    totalWeight += w.location;

    breakdown.push({
      label: 'Localização',
      weight: w.location,
      score: locPct,
      maxScore: w.location,
      percentage: Math.round(locScore * 100),
      matched: locScore > 0,
      details: detail,
    });
    reasons.push({
      criterion: 'Localização',
      matched: locScore > 0,
      weight: w.location,
      details: detail,
    });
  }

  // ── 6. Tipo de Contrato (5%) ──
  {
    let contractScore = 0;
    let detail = '';

    if (job.contract_type && candidate.contract_types?.length) {
      if (
        candidate.contract_types.some(
          (ct) => normalizeText(ct) === normalizeText(job.contract_type),
        )
      ) {
        contractScore = 1;
        detail = `Você aceita ${job.contract_type}`;
      } else {
        contractScore = 0;
        detail = `Você não aceita ${job.contract_type}`;
      }
    } else {
      contractScore = 0.5;
      detail = 'Tipo de contrato não especificado nas preferências';
    }

    const contractPct = Math.round(contractScore * w.contract_type);
    totalWeighted += contractPct;
    totalWeight += w.contract_type;

    breakdown.push({
      label: 'Tipo de contrato',
      weight: w.contract_type,
      score: contractPct,
      maxScore: w.contract_type,
      percentage: Math.round(contractScore * 100),
      matched: contractScore >= 0.5,
      details: detail,
    });
    reasons.push({
      criterion: 'Tipo de contrato',
      matched: contractScore >= 0.5,
      weight: w.contract_type,
      details: detail,
    });
  }

  // ── 7. Pretensão Salarial (5%) ──
  {
    let salaryScore = 0;
    let detail = '';

    const jobMin = job.salary_min ?? 0;
    const jobMax = job.salary_max ?? 0;
    const candMin = candidate.salary_min ?? candidate.salary_expectation_min ?? 0;
    const candMax = candidate.salary_max ?? candidate.salary_expectation_max ?? 0;

    if (jobMin > 0 && jobMax > 0 && candMin > 0 && candMax > 0) {
      const overlap = Math.min(candMax, jobMax) - Math.max(candMin, jobMin);
      if (overlap > 0) {
        salaryScore = 1;
        detail = 'Sua pretensão salarial está dentro da faixa da vaga';
      } else {
        salaryScore = 0.3;
        detail = 'Pretensão salarial fora da faixa, mas próxima';
      }
    } else if (jobMin > 0 && candMax > 0 && candMax >= jobMin * 0.8) {
      salaryScore = 0.7;
      detail = 'Pretensão compatível com o salário mínimo da vaga';
    } else if (jobMin === 0) {
      salaryScore = 0.5;
      detail = 'Salário não informado na vaga';
    } else {
      salaryScore = 0.5;
      detail = 'Dados de salário insuficientes para comparação';
    }

    const salaryPct = Math.round(salaryScore * w.salary);
    totalWeighted += salaryPct;
    totalWeight += w.salary;

    breakdown.push({
      label: 'Pretensão salarial',
      weight: w.salary,
      score: salaryPct,
      maxScore: w.salary,
      percentage: Math.round(salaryScore * 100),
      matched: salaryScore > 0,
      details: detail,
    });
    reasons.push({
      criterion: 'Pretensão salarial',
      matched: salaryScore > 0,
      weight: w.salary,
      details: detail,
    });
  }

  // ── 8. Disponibilidade (5%) ──
  {
    let availScore = 0;
    let detail = '';

    if (candidate.available_from) {
      const availDate = new Date(candidate.available_from);
      const now = new Date();
      if (!isNaN(availDate.getTime())) {
        const diffDays = Math.ceil(
          (availDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays <= 7) {
          availScore = 1;
          detail = 'Você está disponível em até 7 dias';
        } else if (diffDays <= 30) {
          availScore = 0.7;
          detail = `Você está disponível em ${diffDays} dias`;
        } else {
          availScore = 0.3;
          detail = `Você estará disponível em ${diffDays} dias`;
        }
      }
    } else {
      availScore = 0.5;
      detail = 'Data de disponibilidade não informada';
    }

    const availPct = Math.round(availScore * w.availability);
    totalWeighted += availPct;
    totalWeight += w.availability;

    breakdown.push({
      label: 'Disponibilidade',
      weight: w.availability,
      score: availPct,
      maxScore: w.availability,
      percentage: Math.round(availScore * 100),
      matched: availScore > 0,
      details: detail,
    });
    reasons.push({
      criterion: 'Disponibilidade',
      matched: availScore > 0,
      weight: w.availability,
      details: detail,
    });
  }

  const finalScore =
    totalWeight > 0 ? Math.round((totalWeighted / totalWeight) * 100) : 0;

  return {
    score: finalScore,
    percentage: finalScore,
    breakdown,
    reasons,
    algorithm_version: ALGORITHM_VERSION,
  };
}

export function matchJobsToCandidate(
  candidate: MatchingCandidate,
  jobs: JobWithSkills[],
): Array<{ job: JobWithSkills; match: MatchResult }> {
  return jobs.map((job) => ({
    job,
    match: matchJobToCandidate(candidate, job),
  }));
}
