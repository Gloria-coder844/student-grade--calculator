const form = document.getElementById('gradeForm');
const resetBtn = document.getElementById('resetBtn');
const resultsSection = document.getElementById('results');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const downloadBtn = document.getElementById('downloadBtn');

const studentNameInput = document.getElementById('studentName');
const mark1Input = document.getElementById('mark1');
const mark2Input = document.getElementById('mark2');
const mark3Input = document.getElementById('mark3');

const nameError = document.getElementById('nameError');
const mark1Error = document.getElementById('mark1Error');
const mark2Error = document.getElementById('mark2Error');
const mark3Error = document.getElementById('mark3Error');

const resultName = document.getElementById('resultName');
const resultTotal = document.getElementById('resultTotal');
const resultAverage = document.getElementById('resultAverage');
const resultPercentage = document.getElementById('resultPercentage');
const resultStatus = document.getElementById('resultStatus');
const resultGrade = document.getElementById('resultGrade');

const PASS_THRESHOLD = 50;
const GRADE_THRESHOLDS = [
    { grade: 'A', min: 80 },
    { grade: 'B', min: 70 },
    { grade: 'C', min: 60 },
    { grade: 'D', min: 50 }
];

function setError(input, errorElement, message) {
    if (message) {
        input.classList.add('error-input');
        errorElement.textContent = message;
    } else {
        input.classList.remove('error-input');
        errorElement.textContent = '';
    }
}

function validateInputs() {
    let isValid = true;

    const name = studentNameInput.value.trim();
    setError(studentNameInput, nameError, '');
    if (name === '') {
        setError(studentNameInput, nameError, 'Student name is required.');
        isValid = false;
    } else if (name.length < 2) {
        setError(studentNameInput, nameError, 'Name must be at least 2 characters.');
        isValid = false;
    }

    const marks = [
        { input: mark1Input, error: mark1Error, label: 'Subject 1' },
        { input: mark2Input, error: mark2Error, label: 'Subject 2' },
        { input: mark3Input, error: mark3Error, label: 'Subject 3' }
    ];

    marks.forEach((field) => {
        setError(field.input, field.error, '');
        const raw = field.input.value.trim();

        if (raw === '') {
            setError(field.input, field.error, `${field.label} marks are required.`);
            isValid = false;
            return;
        }

        const value = Number(raw);
        if (Number.isNaN(value)) {
            setError(field.input, field.error, `${field.label} must be a valid number.`);
            isValid = false;
            return;
        }

        if (value < 0 || value > 100) {
            setError(field.input, field.error, `${field.label} must be between 0 and 100.`);
            isValid = false;
        }
    });

    return isValid;
}

function getLetterGrade(average) {
    for (const entry of GRADE_THRESHOLDS) {
        if (average >= entry.min) return entry.grade;
    }
    return 'F';
}

function getStatus(percentage) {
    return percentage >= PASS_THRESHOLD ? 'Pass' : 'Fail';
}

let lastResult = null;

function calculateGrade(event) {
    event.preventDefault();

    resultsSection.classList.remove('visible');

    if (!validateInputs()) {
        return;
    }

    const name = studentNameInput.value.trim();
    const m1 = Number(mark1Input.value);
    const m2 = Number(mark2Input.value);
    const m3 = Number(mark3Input.value);

    const total = m1 + m2 + m3;
    const average = total / 3;
    const percentage = (total / 300) * 100;
    const grade = getLetterGrade(average);
    const status = getStatus(percentage);

    resultName.textContent = name;
    resultTotal.textContent = `${total} / 300`;
    resultAverage.textContent = average.toFixed(2);
    resultPercentage.textContent = percentage.toFixed(2) + '%';

    resultStatus.textContent = status;
    resultStatus.className = 'result-value status-badge ' + (status === 'Pass' ? 'status-pass' : 'status-fail');

    resultGrade.textContent = grade;
    resultGrade.className = 'result-value grade-badge grade-' + grade;

    resultsSection.classList.add('visible');
    downloadBtn.disabled = false;

    lastResult = {
        name,
        m1, m2, m3,
        total,
        average,
        percentage,
        grade,
        status,
        date: new Date().toLocaleString()
    };
}

function resetForm() {
    form.reset();
    setError(studentNameInput, nameError, '');
    setError(mark1Input, mark1Error, '');
    setError(mark2Input, mark2Error, '');
    setError(mark3Input, mark3Error, '');
    resultsSection.classList.remove('visible');
    downloadBtn.disabled = true;
    lastResult = null;

    resultName.textContent = '-';
    resultTotal.textContent = '-';
    resultAverage.textContent = '-';
    resultPercentage.textContent = '-';
    resultStatus.textContent = '-';
    resultStatus.className = 'result-value status-badge';
    resultGrade.textContent = '-';
    resultGrade.className = 'result-value grade-badge';
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    themeIcon.innerHTML = isDark ? '&#9790;' : '&#9728;';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.innerHTML = '&#9790;';
    }
}

function downloadPDF() {
    if (!lastResult) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Student Grade Report', 105, 20, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 26, 190, 26);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Date: ${lastResult.date}`, 20, 36);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Student Details', 20, 50);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${lastResult.name}`, 20, 60);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Subject Marks', 20, 76);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Subject 1: ${lastResult.m1}`, 25, 86);
    doc.text(`Subject 2: ${lastResult.m2}`, 25, 94);
    doc.text(`Subject 3: ${lastResult.m3}`, 25, 102);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Results', 20, 118);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Total: ${lastResult.total} / 300`, 25, 128);
    doc.text(`Average: ${lastResult.average.toFixed(2)}`, 25, 136);
    doc.text(`Percentage: ${lastResult.percentage.toFixed(2)}%`, 25, 144);
    doc.text(`Status: ${lastResult.status}`, 25, 152);
    doc.text(`Grade: ${lastResult.grade}`, 25, 160);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Generated by Student Grade Calculator', 105, 285, { align: 'center' });

    const filename = `${lastResult.name.replace(/\s+/g, '_')}_grade_report.pdf`;
    doc.save(filename);
}

form.addEventListener('submit', calculateGrade);
resetBtn.addEventListener('click', resetForm);
themeToggle.addEventListener('click', toggleTheme);
downloadBtn.addEventListener('click', downloadPDF);
downloadBtn.disabled = true;
loadTheme();
