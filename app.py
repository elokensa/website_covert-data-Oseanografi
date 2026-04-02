from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "File tidak ditemukan"}), 400
        
        df = pd.read_csv(file)
        df.columns = df.columns.str.strip() # Bersihkan spasi di nama kolom

        # Fungsi pembersih data
        def get_data(col_name):
            if col_name in df.columns:
                return pd.to_numeric(df[col_name], errors='coerce').fillna(0).tolist()
            return [0] * len(df)

        water = get_data('water_level')
        temp = get_data('temperature')
        wind = get_data('wind_speed_avg')
        press = get_data('pressure')
        
        # Hitung Mean Sea Level (MSL)
        msl_val = np.mean(water) if water else 0

        return jsonify({
            "time": df['timestamp'].astype(str).tolist() if 'timestamp' in df.columns else [i for i in range(len(df))],
            "water": water,
            "temp": temp,
            "wind": wind,
            "press": press,
            "msl_val": round(float(msl_val), 3),
            "msl_line": [float(msl_val)] * len(df),
            "stats": {
                "avg_temp": round(float(np.mean(temp)), 2),
                "max_wind": round(float(np.max(wind)), 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)