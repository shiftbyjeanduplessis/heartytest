.hearty-badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.hearty-badge-tile[data-size="sm"] {
  width: 84px;
  min-width: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hearty-badge-inner {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.92));
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.hearty-badge-icon {
  font-size: 28px;
  line-height: 1;
}

.hearty-badge-name,
.hearty-badge-future-name {
  color: #102033;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hearty-badge-name {
  width: 100%;
  font-size: 12px;
  line-height: 1.25;
  text-align: center;
}

.hearty-badge-empty-note {
  margin: 0;
  color: rgba(16, 32, 51, 0.72);
  font-size: 14px;
  line-height: 1.5;
}

.hearty-badge-future-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hearty-badge-future-card {
  border-radius: 22px;
  padding: 14px 14px 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 247, 251, 0.95));
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.hearty-badge-future-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.hearty-badge-future-name {
  font-size: 14px;
  line-height: 1.25;
}

.hearty-badge-future-copy {
  margin: 0 0 10px;
  color: rgba(16, 32, 51, 0.72);
  font-size: 13px;
  line-height: 1.45;
}

.hearty-badge-progress {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(16, 32, 51, 0.08);
}

.hearty-badge-progress-fill {
  display: block;
  height: 100%;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8fb8ff 0%, #5f95ff 100%);
}

@media (max-width: 860px) {
  .hearty-badge-future-list {
    grid-template-columns: 1fr;
  }
}
