from flask import Flask, render_template, request, send_file
from weasyprint import HTML
import os

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        data = {
            "name": request.form["name"],
            "email": request.form["email"],
            "phone": request.form["phone"],
            "skills": request.form["skills"],
            "education": request.form["education"]
        }

        html = render_template("resume.html", data=data)
        pdf_path = "resume.pdf"
        HTML(string=html).write_pdf(pdf_path)

        return send_file(pdf_path, as_attachment=True)

    return render_template("form.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
