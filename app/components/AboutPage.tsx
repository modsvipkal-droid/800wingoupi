"use client";

import { useState } from "react";
import { Icon } from "./Icons";

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the Wingo 30s & 1-Minute prediction engine calculate signals?",
      a: "The engine uses a combination of Mean Reversion Parity, Markov Chain streak transition probabilities, and Bayesian momentum filters. It monitors recent rounds to identify deviations from theoretical equilibrium or sustained trends.",
    },
    {
      q: "Can any prediction tool guarantee a 100% win rate?",
      a: "No. Wingo outcomes are governed by Pseudo-Random Number Generation (PRNG). These tools are designed for statistical analysis, discipline, risk minimization, and bankroll survival through calculated Martingale stages.",
    },
    {
      q: "What is the difference between 30-Second and 1-Minute modes?",
      a: "30-Second mode is rapid with quick turnover. 1-Minute mode offers 60 seconds per round, allowing players to carefully compute Martingale multipliers, check the Bead Road matrix, and avoid rushed decisions.",
    },
    {
      q: "What is a 'Dragon Streak' and how should it be evaluated?",
      a: "A Dragon streak occurs when 4 or more consecutive rounds result in the same outcome (e.g., Big, Big, Big, Big). In probability analysis, players either follow the momentum or wait for deep stages to prepare for a mean-reversion counter balance.",
    },
    {
      q: "How does the Martingale Risk Calculator protect bankroll balance?",
      a: "The calculator computes exact drawdowns before you start. It tells you exactly how many consecutive losses your balance can survive and what base bet size is mathematically safe so you do not liquidate your funds.",
    },
  ];

  return (
    <div className="tool-view-container animate-fade-in">
      {/* Hero Header */}
      <div className="tool-hero-strip">
        <div className="hero-left">
          <span className="live-pulse-badge badge-blue">
            <span className="pulse-dot dot-blue" />
            DOCUMENTATION & KNOWLEDGE BASE
          </span>
          <h1 className="hero-tool-title">About Wingo Logic Tools</h1>
          <p className="hero-tool-desc">
            The comprehensive guide to mathematical probability, game mechanics, algorithm design, and bankroll discipline.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="about-sections-grid">
        <section className="about-card">
          <div className="about-card-icon">
            <Icon name="bolt" size={24} />
          </div>
          <h3>What is Wingo Logic Suite?</h3>
          <p>
            Wingo Logic Suite is an analytics terminal designed to replace blind guessing with mathematical models.
            Whether you are analyzing <strong>30-second rapid cycles</strong> or <strong>1-minute classic rounds</strong>, the platform provides real-time pattern detection, bead road matrices, and portfolio risk management.
          </p>
        </section>

        <section className="about-card">
          <div className="about-card-icon">
            <Icon name="target" size={24} />
          </div>
          <h3>The Core Game Rules</h3>
          <p>
            Wingo is played with numbers <strong>0 through 9</strong> generated in fixed time cycles (30s, 1m):
          </p>
          <ul className="about-list">
            <li><strong>Small (0, 1, 2, 3, 4):</strong> 50% mathematical distribution. Payout approx. 1.96x - 2.0x.</li>
            <li><strong>Big (5, 6, 7, 8, 9):</strong> 50% mathematical distribution. Payout approx. 1.96x - 2.0x.</li>
            <li><strong>Green (1, 3, 7, 9):</strong> Payout approx. 2.0x (Number 5 splits Green + Violet).</li>
            <li><strong>Red (2, 4, 6, 8):</strong> Payout approx. 2.0x (Number 0 splits Red + Violet).</li>
            <li><strong>Violet (0 and 5):</strong> Special color with 4.5x multiplier.</li>
          </ul>
        </section>
      </div>

      {/* Important Disclaimer Notice */}
      <section className="disclaimer-callout-card">
        <div className="disclaimer-icon">
          <Icon name="alert-triangle" size={26} />
        </div>
        <div className="disclaimer-text">
          <h4>Responsible Gaming & Educational Disclaimer</h4>
          <p>
            This application is an educational and analytical tool designed to model probability distributions and demonstrate bankroll risk mechanics.
            Past results never guarantee future outcomes. Games of chance involve financial risk. Never participate with funds you cannot afford to lose, and always practice strict stop-loss limits.
          </p>
        </div>
      </section>

      {/* Mechanics Matrix Table */}
      <section className="about-matrix-card">
        <div className="card-header-clean">
          <h3>Probability & Payout Matrix</h3>
          <span className="badge-pill">Math Rules</span>
        </div>

        <div className="table-responsive">
          <table className="tools-table">
            <thead>
              <tr>
                <th>Outcome</th>
                <th>Included Numbers</th>
                <th>Probability</th>
                <th>Standard Multiplier</th>
                <th>Risk Profile</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Big</strong></td>
                <td className="mono">5, 6, 7, 8, 9</td>
                <td>50.0%</td>
                <td className="mono">1.96x</td>
                <td><span className="risk-rating-tag safe">Low Risk</span></td>
              </tr>
              <tr>
                <td><strong>Small</strong></td>
                <td className="mono">0, 1, 2, 3, 4</td>
                <td>50.0%</td>
                <td className="mono">1.96x</td>
                <td><span className="risk-rating-tag safe">Low Risk</span></td>
              </tr>
              <tr>
                <td><strong>Green</strong></td>
                <td className="mono">1, 3, 7, 9 (+5)</td>
                <td>40.0%</td>
                <td className="mono">2.0x</td>
                <td><span className="risk-rating-tag moderate">Moderate</span></td>
              </tr>
              <tr>
                <td><strong>Red</strong></td>
                <td className="mono">2, 4, 6, 8 (+0)</td>
                <td>40.0%</td>
                <td className="mono">2.0x</td>
                <td><span className="risk-rating-tag moderate">Moderate</span></td>
              </tr>
              <tr>
                <td><strong>Violet</strong></td>
                <td className="mono">0, 5</td>
                <td>20.0%</td>
                <td className="mono">4.5x</td>
                <td><span className="risk-rating-tag aggressive">High Volatility</span></td>
              </tr>
              <tr>
                <td><strong>Single Number</strong></td>
                <td className="mono">Any specific 0-9</td>
                <td>10.0%</td>
                <td className="mono">9.0x</td>
                <td><span className="risk-rating-tag critical">Highest Risk</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-section">
        <div className="card-header-clean">
          <div>
            <h3>Frequently Asked Questions</h3>
            <p>Answers to common questions regarding predictions, timers, and tools</p>
          </div>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-chevron">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-content animate-slide-up">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
