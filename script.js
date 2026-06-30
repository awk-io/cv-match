(function() {
  const fileInput = document.getElementById('resumeFile');
  const fileNameDisplay = document.getElementById('fileName');
  const dropZone = document.getElementById('dropZone');
  const resumeTextarea = document.getElementById('resume');

  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
      fileNameDisplay.textContent = 'no file selected';
      fileNameDisplay.className = 'file-name empty';
      return;
    }
    fileNameDisplay.textContent = file.name + '  (' + (file.size / 1024).toFixed(1) + ' KB)';
    fileNameDisplay.className = 'file-name';
    readFile(file);
  });

  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        fileInput.files = files;
        fileNameDisplay.textContent = file.name + '  (' + (file.size / 1024).toFixed(1) + ' KB)';
        fileNameDisplay.className = 'file-name';
        readFile(file);
      } else {
        fileNameDisplay.textContent = '⚠️ only .txt files';
        fileNameDisplay.className = 'file-name empty';
      }
    }
  });

  dropZone.addEventListener('click', function() {
    fileInput.click();
  });

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      resumeTextarea.value = event.target.result;
    };
    reader.onerror = function() {
      resumeTextarea.value = '';
      fileNameDisplay.textContent = '⚠️ error reading file';
      fileNameDisplay.className = 'file-name empty';
    };
    reader.readAsText(file);
  }

  const darkToggle = document.getElementById('darkToggle');
  darkToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    this.textContent = document.body.classList.contains('dark') ? '◑' : '◐';
  });

  window.analyzeResume = function() {
    const jobText = document.getElementById('job').value.toLowerCase();
    const resumeText = document.getElementById('resume').value.toLowerCase();

    const skills = [
      "python","java","javascript","html","css","react","node","express","mongodb","sql",
      "mysql","postgresql","docker","aws","git","github","linux","typescript","nextjs",
      "firebase","flask","django","kubernetes","c++","c#","php","ruby","swift","kotlin",
      "spring","angular","vue","jquery","bootstrap","tailwind","sass","webpack","babel",
      "redux","graphql","rest","api","microservices","nginx","jenkins","ci/cd","terraform",
      "ansible","helm","prometheus","grafana","elasticsearch","kafka","redis","rabbitmq",
      "postman","swagger","jira","confluence","agile","scrum","kanban","tdd","rust","go",
      "scala","perl","shell","bash","powershell","azure","gcp","cloud","security","oauth",
      "jwt","docker-compose","nginx","apache","devops","sre","data","pandas","numpy","r",
      "tableau","powerbi","excel","vba","sap","salesforce","wordpress","seo","ui/ux","figma"
    ];

    let matched = [];
    let missing = [];

    skills.forEach(skill => {
      if (jobText.includes(skill)) {
        if (resumeText.includes(skill)) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      }
    });

    matched = [...new Set(matched)];
    missing = [...new Set(missing)];

    const total = matched.length + missing.length;
    const score = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    const resultCard = document.getElementById('result');
    resultCard.style.display = 'block';
    document.getElementById('score').textContent = score + '%';
    document.getElementById('progressBar').style.width = score + '%';
    document.getElementById('matchedCount').textContent = matched.length;
    document.getElementById('missingCount').textContent = missing.length;

    let message = '';
    if (score >= 80) message = 'strong alignment';
    else if (score >= 60) message = 'good match · some gaps';
    else if (score >= 40) message = 'moderate match';
    else message = 'significant gap';

    document.getElementById('message').textContent = message;

    document.getElementById('matchedSkills').innerHTML = matched.length
      ? matched.map(s => `<span class="tag match">${s}</span>`).join('')
      : '<span class="tag" style="opacity:0.4;">none</span>';

    document.getElementById('missingSkills').innerHTML = missing.length
      ? missing.map(s => `<span class="tag missing">${s}</span>`).join('')
      : '<span class="tag" style="opacity:0.4;">none</span>';

    const improvements = [];
    if (missing.length > 0) {
      improvements.push(`add ${missing.length} missing skill${missing.length > 1 ? 's' : ''}: ${missing.slice(0,6).join(', ')}${missing.length > 6 ? '…' : ''}`);
    }
    if (score < 70) {
      improvements.push('increase keyword density for core skills');
    }
    const wordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 150) {
      improvements.push('resume is short; expand with experience and metrics');
    }
    if (wordCount > 900) {
      improvements.push('resume is verbose; use concise bullet points');
    }
    if (matched.length === 0 && total > 0) {
      improvements.push('no skills matched; rewrite resume with job keywords');
    }
    if (score >= 80 && missing.length === 0) {
      improvements.push('strong alignment — add certifications or outcomes');
    }
    if (improvements.length === 0) {
      improvements.push('no critical gaps identified');
    }

    const list = document.getElementById('improvementList');
    list.innerHTML = improvements.map(item =>
      `<li><span>•</span> ${item}</li>`
    ).join('');
  };
})();
