# ChefVision AI: Flavor LLM and ML Systems Research

I am a machine learning systems engineer working where model-training dynamics meet low-latency infrastructure. Most of my work focuses on what it actually takes to build, align, and serve models in the real world — from curating raw pre-training corpora and writing custom tokenizers to handling distributed post-training and optimizing production serving engines.

## Project thesis

ChefVision AI is an operational intelligence platform for restaurants. At its center is the **Flavor LLM**, a domain-specific model being trained to connect molecular flavor chemistry with real-world menu constraints and kitchen operations.

Instead of treating restaurant automation as a generic chat problem, ChefVision focuses on the full workflow:

```text
Raw culinary and chemical signals
  -> Structured recipe understanding
  -> Flavor and allergen reasoning
  -> Bottleneck-aware substitutions
  -> Operational recommendations
```

The goal is to build a model that does not merely describe ingredients, but understands how chemical properties, menu constraints, preparation steps, and kitchen throughput interact.

## Current focus

As part of my master’s at San José State University, I am pre-training a domain-specific **100M-parameter transformer from scratch** for the ChefVision Flavor LLM.

This is a from-scratch model-development effort, covering:

- Corpus design.
- Tokenizer engineering.
- Domain-adaptive pre-training.
- Evaluation.
- Serving optimization.

## Custom BPE tokenizer

A major part of this work has been engineering a custom BPE tokenizer for ChefVision’s domain language.

The tokenizer is designed to handle:

- Chemical nomenclature.
- POS shorthand.
- Ingredient and recipe terminology.
- Vendor and kitchen-specific phrasing.

The goal is to avoid ugly token fragmentation and produce more meaningful, semantically stable tokens for model training.

This is especially important because ChefVision needs to reason over both molecular chemistry and restaurant language in the same model.

## Training data

I assembled a domain-specific training mixture that pairs:

- Molecular flavor chemistry.
- Real-world menu taxonomies.
- Operational restaurant logs.

This teaches the Flavor LLM to map volatile aromatic compounds directly to recipe constraints.

The model is intended to support:

- Automated allergen compliance.
- Bottleneck-aware dish substitutions.
- Ingredient-level reasoning.
- Recipe-aware operational planning.

## Serving and inference

Beyond pre-training, I spend a lot of time on the execution and systems layer.

I benchmark and optimize inference runtimes using **vLLM** and **SGLang**.

My focus is on maximizing GPU utilization while keeping latency predictable.

Specific areas include:

- KV-cache management.
- Continuous batching.
- Chunked prefill.
- TTFT reduction.
- Tail-latency control.
- Throughput under concurrent traffic.

## Agent infrastructure

ChefVision’s execution layer is designed around reliable, sandboxed workflows.

The goal is to support long-horizon operational tasks such as:

- Recipe substitution.
- Allergen checking.
- Menu reasoning.
- Inventory-aware recommendations.
- Bottleneck-aware planning.

The system is intended for one-click deployment to AWS and GCP so that the Flavor LLM and its operational workflows can run reproducibly in cloud environments.

## Multimodal and world-model work

ChefVision also involves hands-on work with:

- Vision-language models.
- Speech pipelines across STT and TTS.
- World models focused on state representations and spatial reasoning.

These support ChefVision’s broader operational context, where the model must understand not just text, but recipes, ingredients, kitchen state, and physical workflows.

## Core tooling

PyTorch, Hugging Face, SFT, DPO, LoRA, vLLM, SGLang, Triton, Go, Python, C++, Docker, GCP, and AWS.

## Research direction

The long-term direction is to make the Flavor LLM a reliable domain expert that can reason across:

```text
Chemistry
  -> Flavor
  -> Recipe
  -> Allergens
  -> Kitchen constraints
  -> Substitution strategy
```

The system is not intended to be a generic chatbot. It is being built as a domain-grounded model that can operate inside the practical constraints of real restaurant operations.
