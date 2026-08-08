# Visual ideation

Use this when no visual target has been selected or the user requests alternatives.

## Brief gate

Identify the target, intended user, product surface, user goal, and hard constraints. Inspect relevant screenshots, images, local design-system material, and saved context directly. If a named source cannot be accessed, stop and resolve that gap.

Choose dimensions before prompting:

- Mobile: `390 × 844`
- Tablet: `834 × 1194`
- Desktop application: `1440 × 1024`
- Marketing page: `1440` wide, scrollable
- Component: its natural container size
- Existing reference: match its aspect ratio and dimensions

## Prompt-only generation

Produce exactly three independent image-generation prompts. Each direction must vary meaningfully in hierarchy, layout strategy, interaction model, or product framing—not only color.

Every prompt must:

- State dimensions and surface.
- Preserve the user's hard constraints.
- Describe one focused primary screen with one clear primary action and at most two supporting areas.
- Prefer spacing, grouping, alignment, and typography over excess cards, borders, shadows, or decorative containers.
- Specify realistic content, readable product typography, asset treatment, responsive intent, and relevant interaction states.
- Name the visual references that must be attached.
- For mobile concepts, request app content only, without a device bezel or OS chrome.

Give each direction a distinctive working title outside the prompt. Then tell the user to generate all three, attach the results, and choose one. Do not build until a resulting image is selected. If feedback changes a selected direction, request a revised image before implementation.
