// Global değişkenler
let trees = [];
let currentGame = {
    trees: [],
    currentIndex: 0,
    answers: [],
    score: 0,
    correct: 0,
    wrong: 0,
    skipped: 0
};
let statistics = {};
let notes = {};
let currentNoteTree = '';

// Default ağaç resimleri listesi
const defaultTrees = [
    'Abies nordmanniana.jpg',
    'Acer compestre.jpg',
    'Acer negundo.jpg',
    'Acer pseudoplatanus.jpg',
    'Aesculus hippocastanum.jpg',
    'Ailanthus altissima.jpg',
    'Carpinus betulus.jpg',
    'Carpinus orientalis.jpg',
    'Castanea sativa.jpg',
    'Cedrus libani.jpg',
    'Cercis siliquastrum.jpg',
    'Cornus mas.jpg',
    'Corylus avellana.jpg',
    'Cupressus arizonica.jpg',
    'Cupressus macrocarpa.jpg',
    'Fagus orientalis.jpg',
    'Ficus carica.jpg',
    'Hedera helix.jpg',
    'Juglans regia.jpg',
    'Laurus nobilis.jpg',
    'Morus alba.jpg',
    'Nerium oleander.jpg',
    'Picea orientalis.jpg',
    'Pinus brutia.jpg',
    'Pinus nigra.jpg',
    'Pinus pinaster.jpg',
    'Pinus pinea.jpg',
    'Pinus sylvestris.jpg',
    'Platanus orientalis.jpg',
    'Populus nigra.jpg',
    'Prunus laurocerasus.jpg',
    'Pseudotsuga menziesii.jpg',
    'Quercus cerris.jpg',
    'Quercus pubescens.jpg',
    'Robinia pseudoacacia.jpg',
    'Salix babylonica.jpg',
    'Tilia tomentosa.jpg'
];

// Ses efektleri
const sounds = {
    correct: () => playBeep(800, 200),
    wrong: () => playBeep(400, 300),
    skip: () => playBeep(600, 150),
    delete: () => playBeep(300, 400),
    gameStart: () => playBeep(523, 100, () => playBeep(659, 100)),
    gameEnd: () => playBeep(659, 100, () => playBeep(523, 100, () => playBeep(440, 200)))
};

// Beep sesi oluştur
function playBeep(frequency, duration, callback) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
        
        if (callback) {
            setTimeout(callback, duration);
        }
    } catch (e) {
        console.log('Ses çalınamadı');
    }
}



// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    loadNotes();
    setupEventListeners();
    loadDefaultTrees();
});

// Default ağaçları yükle
function loadDefaultTrees() {
    const uploadText = document.querySelector('.upload-text');
    uploadText.textContent = 'Ağaçlar yükleniyor...';
    uploadText.style.color = '#f59e0b';
    
    let loadedCount = 0;
    const totalTrees = defaultTrees.length;
    
    // Her ağaç için asenkron yükleme
    defaultTrees.forEach((fileName, index) => {
        const treeName = fileName.replace(/\.[^/.]+$/, ''); // Uzantıyı kaldır
        const imagePath = `assets/trees/${fileName}`;
        
        // Resmi preload et
        const img = new Image();
        img.onload = function() {
            // Canvas kullanarak resmi data URL'ye çevir
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            trees.push({
                name: treeName,
                image: dataURL,
                isDefault: true
            });
            
            // İstatistik yoksa oluştur
            if (!statistics[treeName]) {
                statistics[treeName] = {
                    correct: 0,
                    wrong: 0,
                    skipped: 0
                };
            }
            
            loadedCount++;
            uploadText.textContent = `Ağaçlar yükleniyor... (${loadedCount}/${totalTrees})`;
            
            if (loadedCount === totalTrees) {
                uploadText.textContent = `${totalTrees} ağaç hazır! Oyuna başlayabilirsiniz!`;
                uploadText.style.color = '#4ade80';
                
                // Ağaçları alfabetik sırala
                trees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            }
        };
        
        img.onerror = function() {
            console.warn(`Ağaç resmi yüklenemedi: ${fileName}`);
            loadedCount++;
            
            if (loadedCount === totalTrees) {
                const loadedTreesCount = trees.length;
                if (loadedTreesCount > 0) {
                    uploadText.textContent = `${loadedTreesCount} ağaç hazır! Oyuna başlayabilirsiniz!`;
                    uploadText.style.color = '#4ade80';
                    trees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                } else {
                    uploadText.textContent = 'Varsayılan ağaçlar yüklenemedi. Lütfen kendi resimlerinizi yükleyin.';
                    uploadText.style.color = '#ef4444';
                }
            }
        };
        
        img.src = imagePath;
    });
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Enter tuşu ile cevap gönder
    document.getElementById('answer-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    
    // Modal dışına tıklamayla kapat
    document.getElementById('note-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeNoteModal();
        }
    });
    
    document.getElementById('confirm-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeConfirmModal();
        }
    });
}

// Resim yükleme
function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        return;
    }
    
    // Sadece kullanıcı ağaçlarını temizle (default'ları koru)
    trees = trees.filter(tree => tree.isDefault);
    let loadedCount = 0;
    const totalFiles = files.filter(file => file.type.startsWith('image/')).length;
    
    if (totalFiles === 0) {
        alert('Lütfen geçerli resim dosyaları seçin!');
        return;
    }
    
    // Yükleme mesajı göster
    const uploadText = document.querySelector('.upload-text');
    uploadText.textContent = `Resimler yükleniyor... (0/${totalFiles})`;
    uploadText.style.color = '#f59e0b';
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const treeName = file.name.replace(/\.[^/.]+$/, ''); // Uzantıyı kaldır
                trees.push({
                    name: treeName,
                    image: e.target.result,
                    file: file
                });
                
                // İstatistik yoksa oluştur
                if (!statistics[treeName]) {
                    statistics[treeName] = {
                        correct: 0,
                        wrong: 0,
                        skipped: 0
                    };
                }
                
                loadedCount++;
                uploadText.textContent = `Resimler yükleniyor... (${loadedCount}/${totalFiles})`;
                
                if (loadedCount === totalFiles) {
                    updateUploadInfo();
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Yükleme bilgisini güncelle
function updateUploadInfo() {
    const uploadText = document.querySelector('.upload-text');
    if (trees.length > 0) {
        uploadText.textContent = `${trees.length} ağaç yüklendi. Oyuna başlayabilirsiniz!`;
        uploadText.style.color = '#4ade80';
    }
}

// Ekran geçişleri
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goToMainMenu() {
    showScreen('main-menu');
}

// Oyun başlat
function startGame() {
    if (trees.length === 0) {
        alert('Lütfen önce ağaç resimleri yükleyin!');
        return;
    }
    
    sounds.gameStart();
    
    // Oyun verilerini sıfırla
    currentGame = {
        trees: [...trees].sort(() => Math.random() - 0.5), // Karıştır
        currentIndex: 0,
        answers: [],
        score: 0,
        correct: 0,
        wrong: 0,
        skipped: 0
    };
    
    showScreen('game-screen');
    updateGameDisplay();
}

// Oyun ekranını güncelle
function updateGameDisplay() {
    const currentTree = currentGame.trees[currentGame.currentIndex];
    
    document.getElementById('tree-image').src = currentTree.image;
    document.getElementById('current-tree').textContent = currentGame.currentIndex + 1;
    document.getElementById('total-trees').textContent = currentGame.trees.length;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
}

// Cevap gönder
function submitAnswer() {
    const answer = document.getElementById('answer-input').value.trim();
    const currentTree = currentGame.trees[currentGame.currentIndex];
    const isCorrect = answer === currentTree.name;
    
    if (isCorrect) {
        sounds.correct();
        currentGame.correct++;
        statistics[currentTree.name].correct++;
    } else {
        sounds.wrong();
        currentGame.wrong++;
        statistics[currentTree.name].wrong++;
    }
    
    currentGame.answers.push({
        tree: currentTree.name,
        userAnswer: answer,
        correct: isCorrect
    });
    
    nextTree();
}

// Ağacı atla
function skipTree() {
    sounds.skip();
    const currentTree = currentGame.trees[currentGame.currentIndex];
    
    currentGame.skipped++;
    statistics[currentTree.name].skipped++;
    
    currentGame.answers.push({
        tree: currentTree.name,
        userAnswer: '',
        correct: false,
        skipped: true
    });
    
    nextTree();
}

// Sonraki ağaç
function nextTree() {
    currentGame.currentIndex++;
    
    if (currentGame.currentIndex >= currentGame.trees.length) {
        endGame();
    } else {
        setTimeout(() => {
            updateGameDisplay();
        }, 500);
    }
}

// Oyunu bitir
function endGame() {
    sounds.gameEnd();
    
    // Skoru hesapla
    const totalTrees = currentGame.trees.length;
    currentGame.score = Math.round((currentGame.correct / totalTrees) * 100);
    
    // İstatistikleri kaydet
    saveStatistics();
    
    // Sonuç ekranını göster
    showResultScreen();
}

// Sonuç ekranını göster
function showResultScreen() {
    document.getElementById('final-score').textContent = currentGame.score;
    document.getElementById('correct-count').textContent = currentGame.correct;
    document.getElementById('wrong-count').textContent = currentGame.wrong;
    document.getElementById('skipped-count').textContent = currentGame.skipped;
    
    // Yanlış cevapları göster
    const mistakesList = document.getElementById('mistakes-list');
    mistakesList.innerHTML = '';
    
    const mistakes = currentGame.answers.filter(answer => !answer.correct);
    
    if (mistakes.length > 0) {
        mistakes.forEach(mistake => {
            const mistakeDiv = document.createElement('div');
            mistakeDiv.className = 'mistake-item';
            
            const wrongAnswer = mistake.skipped ? 'Atlandı' : mistake.userAnswer;
            
            // Ağacın fotoğrafını bul
            const treeData = trees.find(tree => tree.name === mistake.tree);
            const treeImage = treeData ? treeData.image : '';
            
            mistakeDiv.innerHTML = `
                <div class="mistake-image">
                    <img src="${treeImage}" alt="${mistake.tree}">
                </div>
                <div class="mistake-content">
                    <strong>${mistake.tree}</strong><br>
                    <span class="wrong-answer">Cevabınız: ${wrongAnswer}</span>
                </div>
            `;
            
            mistakesList.appendChild(mistakeDiv);
        });
    } else {
        mistakesList.innerHTML = '<p style="text-align: center; color: #4ade80;">Hiç yanlış yapmadınız! 🎉</p>';
    }
    
    showScreen('result-screen');
}

// Tüm ağaçları göster
function showAllTrees() {
    if (trees.length === 0) {
        alert('Henüz ağaç yüklenmemiş!');
        return;
    }
    
    const treesGrid = document.getElementById('trees-grid');
    treesGrid.innerHTML = '';
    
    trees.forEach(tree => {
        const treeCard = document.createElement('div');
        treeCard.className = 'tree-card';
        
        const noteText = notes[tree.name] || 'Not eklenmemiş...';
        
        // Default ağaçlar için sil butonunu gizle
        const deleteButton = tree.isDefault ? '' : `
            <button class="delete-btn" onclick="deleteTree('${tree.name}')">
                <i class="fas fa-trash"></i> Sil
            </button>
        `;
        
        treeCard.innerHTML = `
            <img src="${tree.image}" alt="${tree.name}">
            <h3>${tree.name}${tree.isDefault ? ' <span style="color: #4ade80; font-size: 0.8em;">(Varsayılan)</span>' : ''}</h3>
            <div class="tree-note">${noteText}</div>
            <div class="tree-actions">
                <button class="note-btn" onclick="openNoteModal('${tree.name}')">
                    <i class="fas fa-edit"></i> Not Düzenle
                </button>
                ${deleteButton}
            </div>
        `;
        
        treesGrid.appendChild(treeCard);
    });
    
    showScreen('trees-screen');
}

// Not modalını aç
function openNoteModal(treeName) {
    currentNoteTree = treeName;
    document.getElementById('note-text').value = notes[treeName] || '';
    document.getElementById('note-modal').classList.add('active');
}

// Not modalını kapat
function closeNoteModal() {
    document.getElementById('note-modal').classList.remove('active');
    currentNoteTree = '';
}

// Notu kaydet
function saveNote() {
    const noteText = document.getElementById('note-text').value.trim();
    
    if (noteText) {
        notes[currentNoteTree] = noteText;
    } else {
        delete notes[currentNoteTree];
    }
    
    saveNotes();
    closeNoteModal();
    
    // Eğer ağaçlar ekranında isek güncelle
    if (document.getElementById('trees-screen').classList.contains('active')) {
        showAllTrees();
    }
}

// Ağaç sil
function deleteTree(treeName) {
    // Default ağaçları silinmesini engelle
    const tree = trees.find(t => t.name === treeName);
    if (tree && tree.isDefault) {
        alert('Varsayılan ağaçlar silinemez!');
        return;
    }
    
    showConfirmModal(`"${treeName}" ağacını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`, () => {
        // Ses efekti çal
        sounds.delete();
        
        // Ağacı trees array'inden sil
        trees = trees.filter(tree => tree.name !== treeName);
        
        // İstatistiklerden sil
        if (statistics[treeName]) {
            delete statistics[treeName];
            saveStatistics();
        }
        
        // Notlardan sil
        if (notes[treeName]) {
            delete notes[treeName];
            saveNotes();
        }
        
        // Eğer ağaçlar ekranında isek güncelle
        if (document.getElementById('trees-screen').classList.contains('active')) {
            showAllTrees();
        }
        
        // Ana menüdeki yükleme bilgisini güncelle
        updateUploadInfo();
        
        // Başarı mesajı için küçük bir animasyon
        const uploadText = document.querySelector('.upload-text');
        const originalText = uploadText.textContent;
        uploadText.textContent = `"${treeName}" ağacı silindi!`;
        uploadText.style.color = '#ef4444';
        
        setTimeout(() => {
            updateUploadInfo();
        }, 2000);
    });
}

// Eksikleri göster
function showWeaknesses() {
    const weaknessesList = document.getElementById('weaknesses-list');
    weaknessesList.innerHTML = '';
    
    // En çok yanlış yapılan ağaçları hesapla
    const weaknesses = Object.entries(statistics)
        .map(([name, stats]) => {
            const total = stats.correct + stats.wrong + stats.skipped;
            const errorRate = total > 0 ? ((stats.wrong + stats.skipped) / total) * 100 : 0;
            return {
                name,
                errorRate,
                stats,
                total
            };
        })
        .filter(item => item.total > 0)
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 10); // İlk 10 eksik
    
    if (weaknesses.length === 0) {
        weaknessesList.innerHTML = '<p style="text-align: center; color: white; padding: 40px;">Henüz oyun oynamamışsınız!</p>';
    } else {
        weaknesses.forEach(weakness => {
            const weaknessDiv = document.createElement('div');
            weaknessDiv.className = 'weakness-item';
            
            weaknessDiv.innerHTML = `
                <div class="weakness-info">
                    <h4>${weakness.name}</h4>
                    <div class="weakness-stats">
                        Doğru: ${weakness.stats.correct}, 
                        Yanlış: ${weakness.stats.wrong}, 
                        Atlandı: ${weakness.stats.skipped}
                    </div>
                </div>
                <div class="weakness-score">
                    %${Math.round(weakness.errorRate)} hata
                </div>
            `;
            
            weaknessesList.appendChild(weaknessDiv);
        });
    }
    
    showScreen('weaknesses-screen');
}

// İstatistikleri sıfırla
function resetStats() {
    showConfirmModal('Tüm istatistikler silinecek. Emin misiniz?', () => {
        statistics = {};
        notes = {};
        saveStatistics();
        saveNotes();
        
        // Ağaç istatistiklerini yeniden oluştur
        trees.forEach(tree => {
            statistics[tree.name] = {
                correct: 0,
                wrong: 0,
                skipped: 0
            };
        });
        
        saveStatistics();
        goToMainMenu();
    });
}

// Onay modalını göster
function showConfirmModal(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').classList.add('active');
    
    window.confirmCallback = callback;
}

// Onay modalını kapat
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('active');
    window.confirmCallback = null;
}

// Onay aksiyonunu gerçekleştir
function confirmAction() {
    if (window.confirmCallback) {
        window.confirmCallback();
    }
    closeConfirmModal();
}

// İstatistikleri kaydet
function saveStatistics() {
    localStorage.setItem('dendroloji-statistics', JSON.stringify(statistics));
}

// İstatistikleri yükle
function loadStatistics() {
    const saved = localStorage.getItem('dendroloji-statistics');
    if (saved) {
        statistics = JSON.parse(saved);
    }
}

// Notları kaydet
function saveNotes() {
    localStorage.setItem('dendroloji-notes', JSON.stringify(notes));
}

// Notları yükle
function loadNotes() {
    const saved = localStorage.getItem('dendroloji-notes');
    if (saved) {
        notes = JSON.parse(saved);
    }
}



// Klavye kısayolları
document.addEventListener('keydown', function(e) {
    // Oyun ekranında
    if (document.getElementById('game-screen').classList.contains('active')) {
        if (e.key === 'Escape') {
            goToMainMenu();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            skipTree();
        }
    }
    
    // Modal'lar için Escape
    if (e.key === 'Escape') {
        if (document.getElementById('note-modal').classList.contains('active')) {
            closeNoteModal();
        }
        if (document.getElementById('confirm-modal').classList.contains('active')) {
            closeConfirmModal();
        }
    }
});

// PWA desteği için
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker kayıt başarılı');
            })
            .catch(function(error) {
                console.log('ServiceWorker kayıt başarısız');
            });
    });
} 