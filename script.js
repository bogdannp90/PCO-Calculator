// --- Fraction Object și gcd (nemodificate) ---
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function Fraction(numerator, denominator = 1) {
    if (denominator === 0) {
        throw new Error("Denominator cannot be zero.");
    }
    if (typeof numerator === 'string') {
        if (numerator.includes('/')) {
            const parts = numerator.split('/');
            numerator = parseInt(parts[0]);
            denominator = parseInt(parts[1]);
        } else {
            const numFloat = parseFloat(numerator);
            if (!Number.isInteger(numFloat)) {
                let den = 1000000; 
                let num = Math.round(numFloat * den);
                const commonDivisor = gcd(num, den);
                numerator = num / commonDivisor;
                denominator = den / commonDivisor;
            } else {
                 numerator = numFloat;
                 denominator = 1;
            }
        }
    } else if (typeof numerator === 'number' && !Number.isInteger(numerator)) {
        let den = 1000000;
        let num = Math.round(numerator * den);
        const commonDivisor = gcd(num, den);
        numerator = num / commonDivisor;
        denominator = den / commonDivisor;
    }

    const common = gcd(numerator, denominator);
    this.num = numerator / common;
    this.den = denominator / common;

    if (this.den < 0) {
        this.num = -this.num;
        this.den = -this.den;
    }
}

Fraction.prototype.toString = function() {
    if (this.num === 0) return "0";
    if (this.den === 1) return this.num.toString();
    return `${this.num}/${this.den}`;
};

Fraction.prototype.valueOf = function() {
    return this.num / this.den;
};

Fraction.add = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    return new Fraction(fA.num * fB.den + fB.num * fA.den, fA.den * fB.den);
};

Fraction.subtract = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    return new Fraction(fA.num * fB.den - fB.num * fA.den, fA.den * fB.den);
};

Fraction.multiply = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    return new Fraction(fA.num * fB.num, fA.den * fB.den);
};

Fraction.divide = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    if (fB.num === 0) throw new Error("Division by zero fraction.");
    return new Fraction(fA.num * fB.den, fA.den * fB.num);
};

Fraction.abs = function(a) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    return new Fraction(Math.abs(fA.num), fA.den);
}

// --- Helper Functions ---
function getElement(id) {
    return document.getElementById(id);
}

function clearResults() {
    getElement('resultsArea').innerHTML = '';
}

function appendHtml(htmlContent, areaId = 'resultsArea') {
    getElement(areaId).innerHTML += htmlContent;
}

function formatNumberDisplay(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    if (Math.abs(num - Math.round(num)) < 1e-9) { 
        return Math.round(num).toString();
    }
    return num.toFixed(5); 
}

// --- Matrix Input Functions (nemodificate) ---
const defaultMatrix = [
    [4, 3, 2],
    [1, 5, 3],
    [2, 2, 4]
];

function setupMatrixInputs() {
    const numRows = parseInt(getElement('numRows').value) || 3;
    const numCols = parseInt(getElement('numCols').value) || 3;
    getElement('numRows').value = numRows;
    getElement('numCols').value = numCols;

    const table = getElement('matrixInputTable');
    table.innerHTML = '';

    const headerRow = table.insertRow();
    // MODIFICAT: Folosește clasa header-diagonal-light
    headerRow.insertCell().outerHTML = `<th class="header-diagonal-generated">
                                        <span class="diag-text-top-right">B</span>
                                        <span class="diag-text-bottom-left">A</span>
                                    </th>`;
    for (let j = 0; j < numCols; j++) {
        headerRow.insertCell().outerHTML = `<th>b<sub>${j + 1}</sub></th>`;
    }

    for (let i = 0; i < numRows; i++) {
        const row = table.insertRow();
        row.insertCell().outerHTML = `<th>a<sub>${i + 1}</sub></th>`;
        for (let j = 0; j < numCols; j++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `matrix_val_${i}_${j}`;
            input.size = 5;
            if (i < defaultMatrix.length && j < defaultMatrix[0].length &&
                numRows === defaultMatrix.length && numCols === defaultMatrix[0].length) {
                input.value = defaultMatrix[i][j];
            } else {
                input.value = (i===j) ? "1" : "0"; 
            }
            cell.appendChild(input);
        }
    }
}

function getMatrixFromInputs() {
    const numRows = parseInt(getElement('numRows').value);
    const numCols = parseInt(getElement('numCols').value);
    const matrix = [];
    let allValid = true;

    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numCols; j++) {
            const inputVal = getElement(`matrix_val_${i}_${j}`).value;
            try {
                new Fraction(inputVal); 
                row.push(inputVal); 
            } catch (e) {
                allValid = false;
                alert(`Input invalid "${inputVal}" la linia ${i+1}, coloana ${j+1}. Folosiți numere (ex: 3, 0.5) sau fracții (ex: 5/2).`);
                break;
            }
        }
        if (!allValid) break;
        matrix.push(row);
    }
    return allValid ? matrix : null;
}

// --- Game Theory and LP Functions ---
function afiseazaMatriceJocHtml(gameMatrixStrings) {
    const gameMatrixNumeric = gameMatrixStrings.map(row => row.map(valStr => new Fraction(valStr).valueOf()));
    const m = gameMatrixNumeric.length;
    const n = gameMatrixNumeric[0].length;

    const alpha = gameMatrixNumeric.map(row => Math.min(...row));
    const beta = [];
    for (let j = 0; j < n; j++) {
        let maxCol = gameMatrixNumeric[0][j];
        for (let i = 1; i < m; i++) {
            if (gameMatrixNumeric[i][j] > maxCol) maxCol = gameMatrixNumeric[i][j];
        }
        beta.push(maxCol);
    }

    const v1 = Math.max(...alpha);
    const v2 = Math.min(...beta);

    // Construiește HTML-ul pentru tabel
    let tableTitleHtml = `<h4>Matricea de Joc Introdusă (Payoff pentru A)</h4>`;
    let tableContentHtml = `<table class="game-display-table"><thead><tr>`;
    tableContentHtml += `<th class='header-diagonal-generated'>
                            <span class="diag-text-top-right">B</span>
                            <span class="diag-text-bottom-left">A</span>
                         </th>`;
    for (let j = 0; j < n; j++) {
        tableContentHtml += `<th>b<sub>${j + 1}</sub></th>`;
    }
    tableContentHtml += `<th class="summary-column">α = MIN linii</th></tr></thead><tbody>`;

    for (let i = 0; i < m; i++) {
        tableContentHtml += `<tr><th>a<sub>${i + 1}</sub></th>`;
        for (let j = 0; j < n; j++) {
            tableContentHtml += `<td>${new Fraction(gameMatrixStrings[i][j]).toString()}</td>`;
        }
        tableContentHtml += `<td class="summary-column">${new Fraction(alpha[i].toString()).toString()}</td></tr>`;
    }
    
    tableContentHtml += `<tr><th>β=MAX col</th>`; 
    for (let j = 0; j < n; j++) {
        tableContentHtml += `<td>${new Fraction(beta[j].toString()).toString()}</td>`;
    }
    tableContentHtml += `<td class="v1v2-diagonal-cell summary-column">
                            <span class="v1-text">V<sub>1</sub> = MAX(α) = ${formatNumberDisplay(v1)}</span>
                            <span class="v2-text">V<sub>2</sub> = MIN(β) = ${formatNumberDisplay(v2)}</span>
                         </td>`; 
    tableContentHtml += `</tbody></table>`;

    // Construiește HTML-ul pentru textul analizei V1/V2
    let analysisParagraphHtml = '';
    if (Math.abs(v1 - v2) < 1e-9) {
        analysisParagraphHtml = `<p class="saddle-point-found">Punct șa găsit: V = ${formatNumberDisplay(v1)}. Jocul are o soluție în strategii pure.</p>`;
    } else {
        analysisParagraphHtml = `<p>V1 (${formatNumberDisplay(v1)}) ≠ V2 (${formatNumberDisplay(v2)}). Nu există punct șa. Se caută soluții în strategii mixte. Valoarea jocului V aparține [${formatNumberDisplay(v1)}, ${formatNumberDisplay(v2)}].</p>`;
    }

    // Combină tabelul și analiza într-un container flex
    let finalHtml = `
        <div class="game-matrix-container">
            <div class="game-matrix-table-wrapper">
                ${tableTitleHtml}
                ${tableContentHtml}
            </div>
            <div class="game-matrix-analysis-wrapper">
                <h5>Analiza Inițială a Jocului</h5>
                ${analysisParagraphHtml}
            </div>
        </div>`;
    appendHtml(finalHtml);

    return { v1: v1, v2: v2 };
}

function genereazaPlJocHtml(gameMatrixStrings) { 
    const gameMatrix = gameMatrixStrings.map(row => row.map(valStr => new Fraction(valStr)));
    const numRows = gameMatrix.length; 
    const numCols = gameMatrix[0].length; 

    let html = `<h3>Problema de Programare Liniară pentru Jucătorul A (MIN)</h3>`;
    let fx = [];
    for (let i = 0; i < numRows; i++) fx.push(`x<sub>${i+1}</sub>`);
    html += `<p>Minimizăm: f(x) = ${fx.join(' + ')}</p>`;
    html += `<p>Restricții:</p><ul>`;
    for (let j = 0; j < numCols; j++) { 
        let restriction = [];
        for (let i = 0; i < numRows; i++) { 
            restriction.push(`${gameMatrix[i][j].toString()} * x<sub>${i+1}</sub>`);
        }
        html += `<li>${restriction.join(' + ')} >= 1</li>`;
    }
    html += `<li>${fx.join(', ')} >= 0</li></ul>`;

    html += `<h3>Problema de Programare Liniară pentru Jucătorul B (MAX)</h3>`;
    let gy = [];
    for (let j = 0; j < numCols; j++) gy.push(`y<sub>${j+1}</sub>`);
    html += `<p>Maximizăm: g(y) = ${gy.join(' + ')}</p>`;
    html += `<p>Restricții:</p><ul>`;
    for (let i = 0; i < numRows; i++) { 
        let restriction = [];
        for (let j = 0; j < numCols; j++) { 
            restriction.push(`${gameMatrix[i][j].toString()} * y<sub>${j+1}</sub>`);
        }
        html += `<li>${restriction.join(' + ')} <= 1</li>`;
    }
    html += `<li>${gy.join(', ')} >= 0</li></ul>`;
    appendHtml(html);
}

// --- MODIFICAT: generateSimplexIterationHtml ---
// Returnează DOAR HTML-ul tabelului, fără H4. H4 va fi adăugat în rezolvaPLB_js
function generateSimplexTableHtml( // Nume schimbat pentru claritate
    c_objective_coeffs, 
    numDecisionVars, 
    numSlackVars, 
    totalVars_LP,
    tableauRowsData,
    z_value, 
    cj_zj_values, 
    pivotCol_0_indexed, 
    pivotRow_0_indexed,
    isInitialTableau,
    iterationNum 
) {
    let html = `<table><thead>`;

    if (isInitialTableau) {
        html += `<tr>`;
        // MODIFICAT: Adăugat rowspan="2" și stil pentru aliniere verticală pentru MAX
        // Stilurile inline pentru background și color au fost deja eliminate anterior
        html += `<th colspan="3" rowspan="2" style="vertical-align: middle;">MAX</th>`; 
        for (let j = 0; j < numDecisionVars; j++) {
            html += `<th>y<sub>${j + 1}</sub></th>`;
        }
        for (let j = 0; j < numSlackVars; j++) {
            html += `<th>U<sub>${j + 1}</sub></th>`;
        }
        html += `</tr>`; 

        html += `<tr>`;
        // MODIFICAT: Eliminat th-ul gol care era sub MAX colspan="3"
        // Celulele pentru Cj coefficients încep direct
        for (let j = 0; j < c_objective_coeffs.length; j++) {
            html += `<th>${c_objective_coeffs[j].toString()}</th>`;
        }
        html += `</tr>`;
    }

    html += `<tr>`;
    html += `<th>C<sub>B</sub></th><th>B</th><th>X<sub>B</sub></th>`;
    for (let j = 0; j < totalVars_LP; j++) { 
        let colName = `a<sub>${j + 1}</sub>`;
        if (j === pivotCol_0_indexed && pivotCol_0_indexed !== -1) { 
            colName += " <span style='color:#e74c3c; font-weight:bold;'>&darr;</span>";
        }
        html += `<th>${colName}</th>`;
    }
    html += `</tr>`;
    html += `</thead><tbody>`;

    tableauRowsData.forEach((rowData, rIdx) => {
        html += `<tr>`;
        html += `<td>${rowData.cb.toString()}</td>`;
        let basicVar_ak_Name = `a<sub>${rowData.b_idx + 1}</sub>`;
        if (rIdx === pivotRow_0_indexed && pivotRow_0_indexed !== -1) { 
            basicVar_ak_Name += " <span style='color:#3498db; font-weight:bold;'>&uarr;</span>";
        }
        html += `<td>${basicVar_ak_Name}</td>`;
        html += `<td>${rowData.xb.toString()}</td>`;
        rowData.coeffs.forEach(coeff => {
            html += `<td>${coeff.toString()}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody><tfoot>`;
    
    let zLabel = `Z<sup>${iterationNum}</sup>`;
    if (isInitialTableau && iterationNum === 0) { 
         html += `<tr><td>Z<sup>0</sup>=${z_value.toString()}</td><td></td><td></td>`; 
    } else { 
        html += `<tr><td colspan="3" style="text-align:right;">${zLabel} = ${z_value.toString()}</td>`;
    }

    cj_zj_values.forEach(val => {
        html += `<td>${val.toString()}</td>`;
    });
    html += `</tr>`; 
    html += `</tfoot></table>`;
    return html;
}

function afiseazaInterpretareRezultate(x_optimal_strategies, y_optimal_strategies, V_game, numRows_A, numCols_B) {
    let html = `<h4 style="margin-top: 25px;">Interpretarea Rezultatelor</h4>`;

    // Interpretare pentru Jucătorul A
    html += `<div style="border: 1px solid #eee; padding: 10px; margin-bottom:15px; background-color: #fdfdfd;">`;
    html += `<p><strong>Pentru Jucătorul A:</strong></p><ul style="list-style-type: none; padding-left: 10px;">`;
    for (let i = 0; i < numRows_A; i++) {
        const probValue = x_optimal_strategies[i].valueOf(); // Valoarea probabilității ca număr
        // MODIFICAT: Calculează procentul cu o zecimală și înlocuiește punctul cu virgula
        const percentageNum = probValue * 100;
        const percentageFormatted = percentageNum.toFixed(1).replace('.', ','); // Ex: "25.7" devine "25,7"
        
        if (probValue > 1e-9) { // Afișează doar strategiile cu probabilitate nenulă
            html += `<li>Strategia a<sub>${i + 1}</sub> ar trebui aplicată cu probabilitatea ${x_optimal_strategies[i].toString()} ( ${percentageFormatted}% )</li>`;
        }
    }
    html += `</ul>`;
    html += `<p>Aplicând acest amestec optim de strategii, Jucătorul A își poate asigura un câștig mediu de cel puțin <strong>V = ${V_game.toString()}</strong> (${formatNumberDisplay(V_game.valueOf())}) pe termen lung, indiferent de strategia aleasă de Jucătorul B.</p>`;
    html += `</div>`;

    // Interpretare pentru Jucătorul B
    html += `<div style="border: 1px solid #eee; padding: 10px; background-color: #fdfdfd;">`;
    html += `<p><strong>Pentru Jucătorul B:</strong></p><ul style="list-style-type: none; padding-left: 10px;">`;
    for (let j = 0; j < numCols_B; j++) {
        const probValue = y_optimal_strategies[j].valueOf(); // Valoarea probabilității ca număr
        // MODIFICAT: Calculează procentul cu o zecimală și înlocuiește punctul cu virgula
        const percentageNum = probValue * 100;
        const percentageFormatted = percentageNum.toFixed(1).replace('.', ','); // Ex: "33.3" devine "33,3"

         if (probValue > 1e-9) { // Afișează doar strategiile cu probabilitate nenulă
            html += `<li>Strategia b<sub>${j + 1}</sub> ar trebui aplicată cu probabilitatea ${y_optimal_strategies[j].toString()} ( ${percentageFormatted}% )</li>`;
        }
    }
    html += `</ul>`;
    html += `<p>Aplicând acest amestec optim de strategii, Jucătorul B se poate asigura că pierderea sa medie nu va depăși <strong>V = ${V_game.toString()}</strong> (${formatNumberDisplay(V_game.valueOf())}) pe termen lung, indiferent de strategia aleasă de Jucătorul A.</p>`;
    html += `</div>`;

    appendHtml(html);
}

// --- MODIFICAT: rezolvaPLB_js ---
function rezolvaPLB_js(gameMatrixStrings, v1Initial, v2Initial) {
    appendHtml(`<h2>Algoritmul Simplex pentru Problema PLB (Jucătorul B - MAX)</h2>`);
    const gameMatrix = gameMatrixStrings.map(row => row.map(valStr => new Fraction(valStr)));

    const numRows_A = gameMatrix.length;
    const numCols_B = gameMatrix[0].length;
    const numDecisionVars_B = numCols_B;
    const numSlackVars_LP = numRows_A;
    const totalVars_LP = numDecisionVars_B + numSlackVars_LP;

    let c_objective = [];
    for (let j = 0; j < numDecisionVars_B; j++) c_objective.push(new Fraction(1));
    for (let i = 0; i < numSlackVars_LP; i++) c_objective.push(new Fraction(0));

    let tableau = []; 
    for (let i = 0; i < numRows_A; i++) {
        let currentCoeffs = [];
        for (let j = 0; j < numDecisionVars_B; j++) {
            currentCoeffs.push(new Fraction(gameMatrix[i][j]));
        }
        for (let k = 0; k < numSlackVars_LP; k++) {
            currentCoeffs.push(new Fraction(i === k ? 1 : 0));
        }
        tableau.push({
            b_idx: numDecisionVars_B + i,
            cb: new Fraction(0),
            xb: new Fraction(1),
            coeffs: currentCoeffs
        });
    }

    let iteration = 0;
    const MAX_ITERATIONS = 25;

    while (iteration < MAX_ITERATIONS) {
        const iterationLabelForText = `I<sub>${iteration}</sub>`;
        const iterationNumberForZ = iteration; 

        let z_current = new Fraction(0);
        tableau.forEach(row => {
            z_current = Fraction.add(z_current, Fraction.multiply(row.cb, row.xb));
        });

        let cj_zj_vals = [];
        for (let j = 0; j < totalVars_LP; j++) {
            let zj_col = new Fraction(0);
            tableau.forEach(row => {
                zj_col = Fraction.add(zj_col, Fraction.multiply(row.cb, row.coeffs[j]));
            });
            cj_zj_vals.push(Fraction.subtract(c_objective[j], zj_col));
        }

        let max_cj_zj_val = new Fraction(-Infinity);
        let pivotCol_0_indexed_for_current_step = -1;
        for (let j = 0; j < totalVars_LP; j++) {
            if (cj_zj_vals[j].valueOf() > 1e-9) { 
                if (cj_zj_vals[j].valueOf() > max_cj_zj_val.valueOf()){
                    max_cj_zj_val = cj_zj_vals[j];
                    pivotCol_0_indexed_for_current_step = j;
                }
            }
        }
        
        let minRatio_val = new Fraction(Infinity); 
        let pivotRow_0_indexed_for_current_step = -1;
        if (pivotCol_0_indexed_for_current_step !== -1) { 
            tableau.forEach((row, rIdx) => {
                const A_ik = row.coeffs[pivotCol_0_indexed_for_current_step];
                if (A_ik.valueOf() > 1e-9) { 
                    const current_ratio = Fraction.divide(row.xb, A_ik);
                    if (current_ratio.valueOf() >= -1e-9 && current_ratio.valueOf() < minRatio_val.valueOf()) { 
                        minRatio_val = current_ratio; 
                        pivotRow_0_indexed_for_current_step = rIdx;
                    }
                }
            });
        }
        
        // --- Început Modificare pentru Layout Flex ---
        let iterationContainerHtml = `<div class="simplex-iteration-container">`;
        
        // Partea stângă: Tabelul Simplex
        let tableHtmlContent = generateSimplexTableHtml( // Folosim funcția redenumită
            c_objective,
            numDecisionVars_B,
            numSlackVars_LP,
            totalVars_LP, 
            tableau.map(r => ({...r})), 
            z_current,
            cj_zj_vals, 
            pivotCol_0_indexed_for_current_step, 
            pivotRow_0_indexed_for_current_step,
            iteration === 0,
            iterationNumberForZ 
        );
        iterationContainerHtml += `<div class="simplex-table-wrapper">
                                     <h4>Tabelul Simplex: ${iterationLabelForText}</h4>
                                     ${tableHtmlContent}
                                   </div>`;

        // Partea dreaptă: Analiza Iterației
        let analysisTextHtml = '<h5>Analiza Iterației:</h5>'; // Titlu pentru secțiunea de analiză
        let hasAnalysisContent = false;

        if (pivotCol_0_indexed_for_current_step !== -1) {
            let enteringVarOriginalName = pivotCol_0_indexed_for_current_step < numDecisionVars_B ? 
                                         `y<sub>${pivotCol_0_indexed_for_current_step + 1}</sub>` : 
                                         `U<sub>${pivotCol_0_indexed_for_current_step - numDecisionVars_B + 1}</sub>`;
            let enteringVarName_ak = `a<sub>${pivotCol_0_indexed_for_current_step + 1}</sub>`;
            
            analysisTextHtml += `<p>Există &Delta;<sub>k</sub> > 0 (max &Delta;<sub>k</sub> = ${max_cj_zj_val.toString()} pentru variabila ${enteringVarOriginalName}/${enteringVarName_ak}). Se continuă algoritmul.</p>`;
            hasAnalysisContent = true;

            if (pivotRow_0_indexed_for_current_step !== -1) {
                let leaving_b_idx = tableau[pivotRow_0_indexed_for_current_step].b_idx;
                let leavingVarOriginalName = leaving_b_idx < numDecisionVars_B ? 
                                             `y<sub>${leaving_b_idx + 1}</sub>` : 
                                             `U<sub>${leaving_b_idx - numDecisionVars_B + 1}</sub>`;
                let leavingVarName_ak = `a<sub>${leaving_b_idx + 1}</sub>`;
                let pivotElementActual = tableau[pivotRow_0_indexed_for_current_step].coeffs[pivotCol_0_indexed_for_current_step];
                
                analysisTextHtml += `<p>Variabila ${enteringVarOriginalName} (coloana ${enteringVarName_ak}) intră în bază. ` +
                                   `Variabila ${leavingVarOriginalName} (din rândul bazei ${leavingVarName_ak}) iese din bază (raport minim pozitiv = ${minRatio_val.toString()}). ` +
                                   `Elementul pivot este ${pivotElementActual.toString()} (la intersecția ${leavingVarName_ak} și ${enteringVarName_ak}).</p>`;
            } else { // Intrare validă, dar nicio ieșire -> Nemărginit (mesajul va fi adăugat mai jos)
                 analysisTextHtml += `<p><strong>Problemă nelimitată (Unbounded Solution). Nu se poate selecta o variabilă care să iasă din bază.</strong></p>`;
                 hasAnalysisContent = true;
            }
        } else { // Soluție optimă
             analysisTextHtml += "<p><strong>Toți &Delta;<sub>k</sub>  <= 0. S-a atins soluția optimă. STOP Algoritm.</strong></p>";
             hasAnalysisContent = true;
        }

        if (hasAnalysisContent) {
            iterationContainerHtml += `<div class="simplex-analysis-wrapper">${analysisTextHtml}</div>`;
        }
        
        iterationContainerHtml += `</div>`; // Închide .simplex-iteration-container
        appendHtml(iterationContainerHtml);
        // --- Sfârșit Modificare pentru Layout Flex ---


        if (pivotCol_0_indexed_for_current_step === -1) { 
            // Mesajul de optimalitate e deja în analysisTextHtml
            break;
        }

        if (pivotRow_0_indexed_for_current_step === -1) { 
            // Mesajul de problemă nemărginită e deja în analysisTextHtml
            return { unbounded: true };
        }

        const pivotElement = tableau[pivotRow_0_indexed_for_current_step].coeffs[pivotCol_0_indexed_for_current_step];
        if (Math.abs(pivotElement.valueOf()) < 1e-9) {
            appendHtml("<p style='color:red;'><strong>EROARE: Elementul pivot este zero! Nu se poate continua.</strong></p>");
            return { error: "Pivot element is zero." };
        }

        const oldPivotRowXB = tableau[pivotRow_0_indexed_for_current_step].xb;
        const oldPivotRowCoeffs = [...tableau[pivotRow_0_indexed_for_current_step].coeffs];
        
        tableau[pivotRow_0_indexed_for_current_step].xb = Fraction.divide(oldPivotRowXB, pivotElement);
        tableau[pivotRow_0_indexed_for_current_step].coeffs = oldPivotRowCoeffs.map(c => Fraction.divide(c, pivotElement));
        
        tableau[pivotRow_0_indexed_for_current_step].cb = c_objective[pivotCol_0_indexed_for_current_step];
        tableau[pivotRow_0_indexed_for_current_step].b_idx = pivotCol_0_indexed_for_current_step;

        for (let i = 0; i < tableau.length; i++) {
            if (i !== pivotRow_0_indexed_for_current_step) {
                const factor = tableau[i].coeffs[pivotCol_0_indexed_for_current_step];
                tableau[i].xb = Fraction.subtract(tableau[i].xb, Fraction.multiply(factor, tableau[pivotRow_0_indexed_for_current_step].xb));
                for (let j = 0; j < totalVars_LP; j++) {
                    tableau[i].coeffs[j] = Fraction.subtract(tableau[i].coeffs[j], Fraction.multiply(factor, tableau[pivotRow_0_indexed_for_current_step].coeffs[j]));
                }
            }
        }
        iteration++;
        if (iteration >= MAX_ITERATIONS) {
            appendHtml("<div class='simplex-iteration-container'><div class='simplex-analysis-wrapper'><p><strong>Numărul maxim de iterații atins.</strong></p></div></div>");
            break;
        }
    }

    // --- Solution Extraction ---
    let g_max_final = new Fraction(0);
    tableau.forEach(row => {
        g_max_final = Fraction.add(g_max_final, Fraction.multiply(row.cb, row.xb));
    });

    let final_cj_zj_vals = []; 
    for (let j = 0; j < totalVars_LP; j++) {
        let zj = new Fraction(0);
        tableau.forEach(row => {
            zj = Fraction.add(zj, Fraction.multiply(row.cb, row.coeffs[j]));
        });
        final_cj_zj_vals.push(Fraction.subtract(c_objective[j], zj));
    }

    // Afișarea soluțiilor finale sub ultimul tabel/analiză
    let solutionHtml = `<h3>Soluția Problemei PLB (derulată din ultimul tabel Simplex):</h3>`;
    solutionHtml += `<p>MAX(g) = ${g_max_final.toString()} (${formatNumberDisplay(g_max_final.valueOf())})</p>`;
    
    let y_B_solution_aux = {}; 
    for(let j=0; j<numDecisionVars_B; j++) y_B_solution_aux[`y${j+1}`] = new Fraction(0); 
    tableau.forEach(row => {
        if (row.b_idx < numDecisionVars_B) { 
            y_B_solution_aux[`y${row.b_idx + 1}`] = row.xb; 
        }
    });
    let y_B_str_parts = [];
    for (let j=0; j < numDecisionVars_B; j++) {
        y_B_str_parts.push(`y<sub>${j+1}</sub> = ${y_B_solution_aux[`y${j+1}`].toString()}`);
    }
    solutionHtml += `<p>y<sub>B</sub> (soluții auxiliare pentru B) = (${y_B_str_parts.join(', ')})</p>`;

    solutionHtml += `<h3>Soluția Problemei PLA (derulată din ultimul tabel Simplex):</h3>`;
    solutionHtml += `<p>MIN(f) = ${g_max_final.toString()} (${formatNumberDisplay(g_max_final.valueOf())})</p>`;
    
    let x_A_solution_aux = {}; 
    for (let i = 0; i < numSlackVars_LP; i++) { 
        x_A_solution_aux[`x${i + 1}`] = Fraction.abs(final_cj_zj_vals[numDecisionVars_B + i]);
    }
    let x_A_aux_str_parts = [];
     for (let i=0; i < numSlackVars_LP; i++) { 
        x_A_aux_str_parts.push(`x<sub>${i+1}</sub> = ${x_A_solution_aux[`x${i+1}`].toString()}`);
    }
    solutionHtml += `<p>x<sub>A</sub> (soluții auxiliare pentru A) = (${x_A_aux_str_parts.join(', ')})</p>`;
    appendHtml(solutionHtml);
    
    appendHtml(`<h3>Soluția Jocului:</h3>`);
    if (g_max_final.num === 0) {
        appendHtml("<p style='color:red;'>Valoarea funcției obiectiv g_max este zero. Nu se poate calcula V = 1/g_max. Acest lucru poate indica necesitatea unei translații a matricii de joc.</p>");
        afiseazaInterpretareRezultate([], [], new Fraction(0), numRows_A, numCols_B, true);
        return { error: "g_max is zero for V calculation." };
    }

    const V_game = Fraction.divide(new Fraction(1), g_max_final);
    appendHtml(`<p>V (Valoarea Jocului) = ${V_game.toString()} (${formatNumberDisplay(V_game.valueOf())})</p>`);

    let x_optimal_strategies = [];
    for (let i = 0; i < numSlackVars_LP; i++) { 
        x_optimal_strategies.push(Fraction.multiply(x_A_solution_aux[`x${i+1}`], V_game));
    }
    let x_optimal_str_parts = x_optimal_strategies.map((val, idx) => `x<sub>${idx+1}</sub> = ${val.toString()}`);
    appendHtml(`<p>Strategia optimă pentru Jucătorul A: x<sub>opt</sub> = (${x_optimal_str_parts.join(', ')})</p>`);

    let y_optimal_strategies = [];
    for (let j = 0; j < numDecisionVars_B; j++) { 
         y_optimal_strategies.push(Fraction.multiply(y_B_solution_aux[`y${j+1}`], V_game));
    }
    let y_optimal_str_parts = y_optimal_strategies.map((val, idx) => `y<sub>${idx+1}</sub> = ${val.toString()}`);
    appendHtml(`<p>Strategia optimă pentru Jucătorul B: y<sub>opt</sub> = (${y_optimal_str_parts.join(', ')})<sup>T</sup></p>`);

    appendHtml(`<p>Verificare: Valoarea jocului V=${V_game.toString()} (${formatNumberDisplay(V_game.valueOf())}). Intervalul inițial din matricea de joc: [${formatNumberDisplay(v1Initial)}, ${formatNumberDisplay(v2Initial)}].</p>`);
     if (V_game.valueOf() >= v1Initial - 1e-9 && V_game.valueOf() <= v2Initial + 1e-9) { 
        appendHtml(`<p style="color:green;">Valoarea jocului este în intervalul așteptat.</p>`);
    } else {
        appendHtml(`<p style="color:orange;">Atenție: Valoarea calculată a jocului (${formatNumberDisplay(V_game.valueOf())}) este în afara intervalului inițial [${formatNumberDisplay(v1Initial)}, ${formatNumberDisplay(v2Initial)}].</p>`);
    }

    afiseazaInterpretareRezultate(x_optimal_strategies, y_optimal_strategies, V_game, numRows_A, numCols_B);
}

function runSolver() {
    clearResults();
    appendHtml("<h2>Procesul de Rezolvare</h2>");

    const gameMatrixStrings = getMatrixFromInputs();
    if (!gameMatrixStrings) {
        appendHtml("<p style='color:red;'>Rezolvare anulată din cauza datelor de intrare invalide.</p>");
        return;
    }
    
    const initialCheck = afiseazaMatriceJocHtml(gameMatrixStrings);
    genereazaPlJocHtml(gameMatrixStrings);

    if (Math.abs(initialCheck.v1 - initialCheck.v2) < 1e-9) {
        const V_saddle = new Fraction(initialCheck.v1);
        appendHtml(`<h4>Soluția Jocului (Punct Șa):</h4>`);
        appendHtml(`<p>Valoarea Jocului V = ${formatNumberDisplay(V_saddle.valueOf())}.</p>`);
        appendHtml(`<p>Jocul are o soluție în strategii pure. Jucătorul A ar trebui să aleagă strategia (sau una dintre strategiile) care îi garantează câștigul ${formatNumberDisplay(V_saddle.valueOf())}, iar Jucătorul B ar trebui să aleagă strategia (sau una dintre strategiile) care limitează pierderea la ${formatNumberDisplay(V_saddle.valueOf())}. Aceste strategii corespund elementului (elementelor) șa din matrice.</p>`);
    } else {
        rezolvaPLB_js(gameMatrixStrings, initialCheck.v1, initialCheck.v2);
    }
}

window.onload = setupMatrixInputs;