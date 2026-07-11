/* app.js */
(function() {
    const jobInput = document.getElementById('jobInput');
    const resumeInput = document.getElementById('resumeInput');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const scoreCircle = document.getElementById('scoreCircle');
    const matchedCount = document.getElementById('matchedCount');
    const missingCount = document.getElementById('missingCount');
    const totalCount = document.getElementById('totalCount');
    const matchedList = document.getElementById('matchedList');
    const missingList = document.getElementById('missingList');
    const suggestList = document.getElementById('suggestList');
    const jobWordCount = document.getElementById('jobWordCount');
    const resumeWordCount = document.getElementById('resumeWordCount');

    // Simple keyword extraction - clean and effective
    function extractKeywords(text) {
        // Convert to lowercase and split into words
        const words = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !/^\d+$/.test(w));
        
        // Remove common stopwords
        const stopwords = new Set([
            'the','and','for','are','but','not','you','all','can','had','her','was',
            'one','our','out','see','she','two','use','way','who','your','about',
            'above','after','again','against','along','among','around','because',
            'before','behind','below','beneath','beside','between','beyond','during',
            'except','inside','outside','over','under','upon','through','toward',
            'within','without','according','actually','adjusted','almost','already',
            'although','always','amount','anyhow','anything','anyway','anywhere',
            'around','became','become','becomes','becoming','before','behind',
            'being','below','beside','besides','between','beyond','both','cannot',
            'certain','certainly','clear','clearly','come','could','did','different',
            'does','done','down','during','each','either','enough','especially',
            'even','ever','every','everyone','everything','everywhere','except',
            'fairly','few','for','former','formerly','from','further','furthermore',
            'get','give','given','go','gone','got','great','greatly','had','has',
            'hasnt','having','he','hence','her','here','hereafter','hereby','herein',
            'hereupon','hers','herself','him','himself','his','how','however',
            'hundred','if','indeed','instead','into','is','it','its','itself',
            'just','keep','kept','know','known','least','less','let','like',
            'likely','make','many','may','me','meanwhile','might','more','moreover',
            'most','mostly','much','must','my','myself','name','namely','neither',
            'never','nevertheless','next','no','nobody','none','noone','nor','not',
            'nothing','now','nowhere','of','off','often','on','only','onto','or',
            'other','others','otherwise','our','ours','ourselves','out','over',
            'own','part','particular','particularly','per','perhaps','please',
            'possible','presumably','probably','rather','really','regarding',
            'right','same','seem','seemed','seeming','seems','serious','several',
            'she','should','since','so','some','somehow','someone','something',
            'sometime','sometimes','somewhat','somewhere','still','such','than',
            'that','their','them','themselves','then','thence','there','thereafter',
            'thereby','therefore','therein','thereupon','these','they','this',
            'those','though','through','throughout','thru','thus','to','together',
            'too','toward','towards','under','unless','until','up','upon','us',
            'very','was','we','well','were','what','whatever','when','whence',
            'whenever','where','whereafter','whereas','whereby','wherein',
            'whereupon','wherever','whether','which','while','whither','who',
            'whoever','whole','whom','whose','why','will','with','within',
            'without','would','yet','you','your','yours','yourself','yourselves',
            'experience','especially','required','preferred','nice','good',
            'great','excellent','strong','solid','proven','track','record',
            'history','looking','seeking','hiring','role','position','team',
            'company','client','project','manage','management','lead','leading',
            'led','responsible','responsibilities','duties','tasks','activities',
            'support','provide','ensure','maintain','develop','developing',
            'implement','implementing','design','designing','build','building',
            'create','creating','plan','planning','coordinate','coordinating',
            'analyze','analyzing','evaluate','evaluating','improve','improving',
            'increase','decrease','reduce','growth','grow','exceed','achieve'
        ]);
        
        const filtered = words.filter(w => !stopwords.has(w));
        
        // Remove duplicates while preserving order
        const unique = [];
        const seen = new Set();
        for (const w of filtered) {
            if (!seen.has(w)) {
                seen.add(w);
                unique.push(w);
            }
        }
        
        return unique;
    }

    function updateWordCounts() {
        jobWordCount.textContent = jobInput.value.trim() ? jobInput.value.trim().split(/\s+/).length + ' words' : '0 words';
        resumeWordCount.textContent = resumeInput.value.trim() ? resumeInput.value.trim().split(/\s+/).length + ' words' : '0 words';
    }

    jobInput.addEventListener('input', updateWordCounts);
    resumeInput.addEventListener('input', updateWordCounts);
    updateWordCounts();

    // PDF.js setup
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // File upload handler
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        fileName.textContent = file.name;
        const ext = file.name.toLowerCase().split('.').pop();
        
        if (ext === 'pdf') {
            try {
                const buf = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
                resumeInput.value = text.trim() || 'No text extracted from PDF';
            } catch (err) {
                resumeInput.value = 'Error extracting PDF text';
                console.warn(err);
            }
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => { 
                resumeInput.value = ev.target.result; 
                updateWordCounts();
            };
            reader.onerror = () => { resumeInput.value = 'Error reading file'; };
            reader.readAsText(file);
        }
        updateWordCounts();
    });

    // Drag and drop
    resumeInput.addEventListener('dragover', e => { 
        e.preventDefault(); 
        resumeInput.style.borderColor = '#a0a096'; 
    });
    resumeInput.addEventListener('dragleave', () => { 
        resumeInput.style.borderColor = ''; 
    });
    resumeInput.addEventListener('drop', async e => {
        e.preventDefault();
        resumeInput.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (!file) return;
        fileName.textContent = file.name;
        const ext = file.name.toLowerCase().split('.').pop();
        
        if (ext === 'pdf') {
            try {
                const buf = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
                resumeInput.value = text.trim() || 'No text extracted from PDF';
            } catch (err) {
                resumeInput.value = 'Error extracting PDF text';
                console.warn(err);
            }
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => { 
                resumeInput.value = ev.target.result; 
                updateWordCounts();
            };
            reader.readAsText(file);
        }
        updateWordCounts();
    });

    // Main analysis function
    function analyze() {
        const job = jobInput.value.trim();
        const resume = resumeInput.value.trim();
        
        if (!job || !resume) {
            resultsContainer.classList.remove('visible');
            return;
        }

        // Extract keywords
        const jobKeywords = extractKeywords(job);
        const resumeKeywords = extractKeywords(resume);

        // Find matches and missing
        const matched = [];
        const missing = [];
        
        for (const keyword of jobKeywords) {
            // Check if keyword exists in resume keywords (partial match allowed)
            const found = resumeKeywords.some(rk => 
                rk.includes(keyword) || keyword.includes(rk) || 
                rk.indexOf(keyword) !== -1 || keyword.indexOf(rk) !== -1
            );
            if (found) {
                matched.push(keyword);
            } else {
                missing.push(keyword);
            }
        }

        const total = jobKeywords.length;
        const matchCount = matched.length;
        const missCount = missing.length;
        const score = total > 0 ? Math.round((matchCount / total) * 100) : 0;

        // Update score display
        scoreCircle.textContent = score + '%';
        scoreCircle.className = 'score-circle';
        if (score >= 70) scoreCircle.classList.add('high');
        else if (score >= 40) scoreCircle.classList.add('medium');
        else scoreCircle.classList.add('low');

        matchedCount.textContent = matchCount;
        missingCount.textContent = missCount;
        totalCount.textContent = total;

        // Render matched list
        matchedList.innerHTML = '';
        if (matched.length > 0) {
            matched.forEach(k => {
                const li = document.createElement('li');
                li.className = 'match';
                li.textContent = k;
                matchedList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'none matched';
            matchedList.appendChild(li);
        }

        // Render missing list
        missingList.innerHTML = '';
        if (missing.length > 0) {
            missing.forEach(k => {
                const li = document.createElement('li');
                li.className = 'miss';
                li.textContent = k;
                missingList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'all keywords matched!';
            missingList.appendChild(li);
        }

        // Render suggestions (top 10 missing keywords)
        suggestList.innerHTML = '';
        if (missing.length > 0) {
            const top = missing.slice(0, 10);
            top.forEach(k => {
                const li = document.createElement('li');
                li.textContent = k;
                suggestList.appendChild(li);
            });
            if (missing.length > 10) {
                const li = document.createElement('li');
                li.textContent = '+' + (missing.length - 10) + ' more';
                li.style.background = 'transparent';
                li.style.border = 'none';
                li.style.color = '#8a8a82';
                suggestList.appendChild(li);
            }
        } else {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'no suggestions needed';
            suggestList.appendChild(li);
        }

        resultsContainer.classList.add('visible');
    }

    // Event listeners
    analyzeBtn.addEventListener('click', analyze);

    clearBtn.addEventListener('click', () => {
        jobInput.value = '';
        resumeInput.value = '';
        fileInput.value = '';
        fileName.textContent = 'no file';
        resultsContainer.classList.remove('visible');
        updateWordCounts();
    });

    // Load sample data
    sampleBtn.addEventListener('click', () => {
        jobInput.value = `Senior Software Engineer

Requirements:
- 5+ years of experience with Python
- Strong knowledge of Django or Flask
- Experience with AWS (EC2, S3, RDS)
- Proficiency with React.js
- Familiarity with Docker and Kubernetes
- PostgreSQL experience
- REST API design
- Strong problem-solving skills
- Excellent communication
- Team leadership experience
- Agile development methodology`;

        resumeInput.value = `Software Engineer
Experience:
- 4 years Python development
- Django framework (2 years)
- Flask API development (1 year)
- AWS S3 and EC2 experience
- React.js frontend (2 years)
- PostgreSQL database design
- REST API development
- Docker containerization
- Git version control
- Agile methodology
- Cross-functional collaboration`;

        updateWordCounts();
        setTimeout(analyze, 200);
    });

    // Auto-analyze on input change if results are visible
    let debounce = null;
    function autoAnalyze() {
        if (resultsContainer.classList.contains('visible')) {
            clearTimeout(debounce);
            debounce = setTimeout(analyze, 500);
        }
    }
    jobInput.addEventListener('input', autoAnalyze);
    resumeInput.addEventListener('input', autoAnalyze);

    // Initialize empty
    jobInput.value = '';
    resumeInput.value = '';
    updateWordCounts();
    resultsContainer.classList.remove('visible');

    // Keyboard shortcut: Ctrl+Enter to analyze
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            analyze();
        }
    });

})();
