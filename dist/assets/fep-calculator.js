"use strict";

// Web付録01「計算して確かめる」の二値モデル。
// x ∈ {0,1}、観察は y = 1 に固定。尤度 p(y=1|x=1), p(y=1|x=0) も固定し、
// 事前分布 p(x=1) と認識モデル q(x=1) を動かして、複雑性・正確性・F・サプライズを表示する。

const calculator = document.querySelector("[data-fep-calculator]");

if (calculator) {
  const inputs = Object.fromEntries(
    [...calculator.querySelectorAll("[data-input]")].map((el) => [el.dataset.input, el])
  );
  const outputs = Object.fromEntries(
    [...calculator.querySelectorAll("[data-out]")].map((el) => [el.dataset.out, el])
  );
  const results = Object.fromEntries(
    [...calculator.querySelectorAll("[data-result]")].map((el) => [el.dataset.result, el])
  );

  const likelihoodOne = 0.85; // p(y=1 | x=1)
  const likelihoodZero = 0.2; // p(y=1 | x=0)
  const safeLog = (value) => Math.log(Math.max(value, Number.EPSILON));
  const format = (value) => value.toFixed(3);

  function update() {
    const prior = Number(inputs.prior.value);
    const belief = Number(inputs.belief.value);

    const complexity =
      belief * safeLog(belief / prior) + (1 - belief) * safeLog((1 - belief) / (1 - prior));
    const accuracy = belief * safeLog(likelihoodOne) + (1 - belief) * safeLog(likelihoodZero);
    const freeEnergy = complexity - accuracy;
    const evidence = prior * likelihoodOne + (1 - prior) * likelihoodZero;
    const surprise = -safeLog(evidence);
    const posterior = (prior * likelihoodOne) / evidence;
    const gap = freeEnergy - surprise;

    outputs.prior.value = prior.toFixed(2);
    outputs.belief.value = belief.toFixed(2);
    results.complexity.textContent = format(complexity);
    results.accuracy.textContent = format(accuracy);
    results["free-energy"].textContent = format(freeEnergy);
    results.surprise.textContent = format(surprise);
    results.observation.textContent =
      `事後分布は p(x=1 | y=1) = ${posterior.toFixed(3)}。` +
      `いまの q と事後分布のずれ（KLダイバージェンス）は ${gap.toFixed(3)} nat で、F はサプライズよりちょうどその分だけ大きくなっています。`;
  }

  Object.values(inputs).forEach((input) => input.addEventListener("input", update));
  update();
}
