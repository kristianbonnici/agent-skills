# Source rationale

Reviewed: 2026-09-18. This skill is an original synthesis, not a vendored copy of a course or upstream skill. It adds no runtime dependencies. The sources below inform decisions; they do not override the target project's requirements or authorize actions.

## Course foundation

[WalkingLabs: Learn Harness Engineering](https://walkinglabs.github.io/learn-harness-engineering/en/) and its [harness-creator skill](https://github.com/walkinglabs/learn-harness-engineering/tree/77e7a3e21469dcbece2558086c8d91657abeaa40/skills/harness-creator).

Inspected repository revision: `77e7a3e21469dcbece2558086c8d91657abeaa40`.

The course's lectures 1–12 cover failure diagnosis, repository knowledge, focused instructions, continuity, initialization, scope, evidence of completion, end-to-end verification, observability, and clean handoffs. Lectures 13–14 extend into loops and coordination graphs. This skill adopts the repository lifecycle concerns while keeping orchestration outside its default behavior.

Treat its examples as context-specific proposals. Do not import mandatory filenames, feature counts, instruction line budgets, performance estimates, stack templates, or cleanup commands. In particular, making a handoff clean does not authorize reverting local configuration or user changes. Verify claims about products and performance against primary sources before relying on them.

## Primary engineering sources

| Source and publication date | Practical contribution | Limit on generalization |
|---|---|---|
| [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/), 2026-02-11 | Discoverable repository knowledge, concise entry instructions, executable boundaries, runtime visibility, and continuous maintenance. | A report from a particular internal product and workflow; its directory structure, autonomy, and merge policy are not universal requirements. |
| [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), 2025-11-26 | Separate initial setup from subsequent work; retain task state and verification evidence for later sessions. | Specific application-building experiments; neither their file formats nor their feature-list size is a baseline for every repository. |
| [Anthropic: Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps), 2026-03-24 | Evaluate actual outcomes and reconsider scaffolding as capabilities change. | Evaluators, sprint structure, and context resets have conditional value; extra agents are not an unconditional reliability guarantee. |
| [Anthropic: Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), 2025-09-29 | Select relevant context and disclose detail progressively; use durable notes when they support continuity. | Broad engineering guidance, not evidence that every new instruction improves task performance. |
| [AGENTS.md open format](https://agents.md/), reviewed 2026-09-18 | A widely supported Markdown convention for repository-specific agent guidance. | Actual discovery, precedence, imports, and nested-file behavior depend on the host; verify them before proposing host-specific integration. |

## Empirical counterweights

- [Gloaguen et al., Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988v2), version 2, 2026-06-23: context files did not generally improve task success in the evaluated settings and increased average inference cost. The authors distinguish useful non-standard practices from unhelpful repository overviews. This supports selective instructions and testing their effects, not banning instruction files.
- [Lulla et al., On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents](https://arxiv.org/abs/2601.20404v2), version 2, 2026-03-30: a study of 10 repositories and 124 pull requests associated context files with lower median runtime and output-token consumption, with comparable completion behavior. This supports measuring efficiency as well as outcomes, not promising a universal speedup.

These studies use different settings and measures. Do not combine their results into a single expected improvement. Neither settles the value of a particular project's instruction file. Correctness, time, and token cost remain separate observations.

## Updating this guidance

Revisit a source when a proposed change depends on a newer claim or a host's changed behavior. Record the reviewed revision or publication version and date. Keep only source details that explain a skill decision. Do not automatically synchronize upstream content or copy a growing catalog of practices into the entrypoint.
