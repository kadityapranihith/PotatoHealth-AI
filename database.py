# database.py

import sqlite3

DB_NAME = "predictions.db"


def init_db():
    conn = sqlite3.connect(DB_NAME)

    conn.execute("""
    CREATE TABLE IF NOT EXISTS predictions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        disease TEXT,
        confidence REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
def save_prediction(
    filename,
    disease,
    confidence
):
    conn = sqlite3.connect(DB_NAME)

    conn.execute(
        """
        INSERT INTO predictions(
            filename,
            disease,
            confidence
        )
        VALUES (?, ?, ?)
        """,
        (
            filename,
            disease,
            confidence
        )
    )

    conn.commit()
    conn.close()
def get_history():

    conn = sqlite3.connect(DB_NAME)

    rows = conn.execute("""
        SELECT *
        FROM predictions
        ORDER BY timestamp DESC
    """).fetchall()

    conn.close()

    return rows
def clear_history():
    conn = sqlite3.connect(DB_NAME)

    conn.execute(
        "DELETE FROM predictions"
    )

    conn.commit()
    conn.close()