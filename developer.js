/**
 * TDR空調保全マップ - デベロッパー管理コンソール (developer.js)
 */

// デベロッパー用グローバル状態
const devState = {
  activeLayer: 'area', // 'park' | 'area' | 'facility' | 'entrance'
  selectedItemId: null,
  selectedLayerObj: null,
  baseMapType: 'satellite',
  mapLayers: {},       // 地図上に描画されているLeafletレイヤーの参照 { itemId: layer }
  isVertexEditing: false,
  data: null          // 編集中のマスターデータ (RESORT_DATA のディープコピー)
};

let map = null;
let satelliteTile = null;
let streetTile = null;

// =========================================================
// 1. 初期化
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  initMasterData();
  initDevMap();
  initGeoman();
  switchActiveLayer('area');
  lucide.createIcons();
});

/**
 * マスターデータの初期ロード (localStorageを優先)
 */
function initMasterData() {
  const saved = localStorage.getItem('tdr_facility_custom_data');
  if (saved) {
    try {
      const localObj = JSON.parse(saved);
      const serverTs = RESORT_DATA.lastUpdated || 0;
      const localTs = localObj.lastUpdated || 0;
      // ローカルに編集データがある場合はそれを優先し、即座にサーバー(data.js)へも自動書き出ししてスマホと同期！
      if (localTs >= serverTs || !RESORT_DATA.lastUpdated) {
        devState.data = localObj;
        showToast('編集データを読み込み、スマホ用サーバー(data.js)へ自動同期しました');
        setTimeout(() => syncToServer(devState.data, false), 200);
      } else {
        devState.data = JSON.parse(JSON.stringify(RESORT_DATA));
      }
    } catch (e) {
      devState.data = JSON.parse(JSON.stringify(RESORT_DATA));
    }
  } else {
    devState.data = JSON.parse(JSON.stringify(RESORT_DATA));
  }
  updateLayerCounts();
}

/**
 * 地図の初期化 (舞浜・TDR全域)
 */
function initDevMap() {
  const cfg = devState.data.initialView;

  map = L.map('dev-map', {
    center: cfg.center,
    zoom: cfg.zoom,
    zoomControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  satelliteTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri World Imagery',
    maxNativeZoom: 19,
    maxZoom: 20
  }).addTo(map);

  streetTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: 'CartoDB Voyager',
    maxZoom: 20
  });
}

function toggleBaseMap() {
  if (devState.baseMapType === 'satellite') {
    map.removeLayer(satelliteTile);
    map.addLayer(streetTile);
    devState.baseMapType = 'street';
    showToast('標準地図に切り替えました');
  } else {
    map.removeLayer(streetTile);
    map.addLayer(satelliteTile);
    devState.baseMapType = 'satellite';
    showToast('高解像度衛星写真に切り替えました');
  }
}

/**
 * Leaflet-Geoman (作図・頂点編集エンジン) の初期化
 */
function initGeoman() {
  map.pm.addControls({
    position: 'topleft',
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawCircle: false,
    drawText: false,
    drawPolygon: true,
    editMode: true,
    dragMode: false,
    cutPolygon: false,
    removalMode: false
  });

  // 新規作図完了イベント (ポリゴン または マーカー)
  map.on('pm:create', (e) => {
    const layer = e.layer;
    if (e.shape === 'Marker' || !layer.getLatLngs) {
      const ll = layer.getLatLng();
      map.removeLayer(layer);
      handleNewEquipmentPinCreated(parseFloat(ll.lat.toFixed(6)), parseFloat(ll.lng.toFixed(6)));
      return;
    }
    const latlngs = layer.getLatLngs()[0].map(ll => [
      parseFloat(ll.lat.toFixed(6)),
      parseFloat(ll.lng.toFixed(6))
    ]);

    // 作成中のレイヤーに応じてデータを生成
    handleNewPolygonCreated(latlngs, layer);
  });
}

// =========================================================
// 2. レイヤー切り替え & 地図描画
// =========================================================

/**
 * レイヤー切り替え (park, area, facility, entrance)
 */
function switchActiveLayer(layerType) {
  devState.activeLayer = layerType;
  devState.selectedItemId = null;
  devState.selectedLayerObj = null;

  // タブのUI更新
  document.querySelectorAll('.layer-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-layer') === `layer-${layerType}`);
  });

  // サイドバーのタイトル更新
  const titles = {
    park: 'L1: パーク大枠 (TDL / TDS)',
    area: 'L2: 保全工区エリア (Work Areas)',
    facility: 'L3: 施設・建物枠 (Facilities)',
    entrance: 'L4: 入口・設備ピン (Points)'
  };
  document.getElementById('current-layer-tag').textContent = titles[layerType];

  // 地図上のレイヤーを再描画
  renderMapElements();

  // サイドバーリストを再描画
  renderSidebarList();

  // インスペクターをクリア
  clearInspector();

  // ガイダンス更新
  const hints = {
    park: 'L1: パーク（TDL / TDS）の枠線や全体設定を編集できます',
    area: 'L2: 工区エリアの色分け枠を選択して色や境界線を編集できます',
    facility: 'L3: 施設・アトラクションの建物枠やカテゴリを編集できます',
    entrance: 'L4: 入口ピンの位置や写真・設備項目を確認できます'
  };
  document.getElementById('dev-hint-text').textContent = hints[layerType];
}

/**
 * 地図上の全要素をクリアして、現在レイヤーに応じた要素を描画
 */
function renderMapElements() {
  // 既存の管理レイヤーを全削除
  Object.values(devState.mapLayers).forEach(layer => map.removeLayer(layer));
  devState.mapLayers = {};

  const cur = devState.activeLayer;

  // L1: パークレイヤー
  if (cur === 'park') {
    devState.data.parks.forEach(park => {
      const poly = L.polygon(park.polygon, {
        color: park.color,
        fillColor: park.color,
        fillOpacity: 0.25,
        weight: 3
      }).addTo(map);

      poly.bindTooltip(`<b>${park.shortName}</b>: ${park.name}`, { permanent: true, direction: 'center', className: 'park-label-tooltip' });
      poly.on('click', () => selectItem(park.id));
      devState.mapLayers[park.id] = poly;
    });
  }

  // L2: エリアレイヤー (L1パーク枠は邪魔になるため非表示、中心ラベルは番号バッジ化)
  if (cur === 'area') {
    const parkCountMap = {};
    devState.data.areas.forEach(area => {
      parkCountMap[area.parkId] = (parkCountMap[area.parkId] || 0) + 1;
      const num = parkCountMap[area.parkId];

      const poly = L.polygon(area.polygon, {
        color: area.color,
        fillColor: area.fillColor || area.color,
        fillOpacity: area.fillOpacity || 0.25,
        weight: 3
      }).addTo(map);

      poly.bindTooltip(`<span class="dev-area-num-badge" style="border-color:${area.color};">${num}</span>`, {
        permanent: true,
        direction: 'center',
        className: 'dev-area-num-tooltip'
      });
      poly.on('click', () => selectItem(area.id));
      devState.mapLayers[area.id] = poly;
    });
  }

  // L3: 施設・建物レイヤー (背景としてエリア枠も薄く表示)
  if (cur === 'facility') {
    // 背景エリア枠
    devState.data.areas.forEach(area => {
      const bg = L.polygon(area.polygon, { color: area.color, fillOpacity: 0.05, weight: 1, dashArray: '4,4' }).addTo(map);
      devState.mapLayers[`bg-${area.id}`] = bg;
    });

    devState.data.facilities.forEach(fac => {
      if (fac.polygon) {
        const poly = L.polygon(fac.polygon, {
          color: fac.color,
          fillColor: fac.fillColor || fac.color,
          fillOpacity: 0.4,
          weight: 2
        }).addTo(map);

        poly.bindTooltip(`<b>${fac.name}</b>`, { permanent: true, direction: 'top', className: 'area-label-tooltip' });
        poly.on('click', () => selectItem(fac.id));
        devState.mapLayers[fac.id] = poly;
      }
    });
  }

  // L4: 空調機マスター・入口ピンレイヤー (背景として建物枠も薄く表示)
  if (cur === 'entrance') {
    devState.data.facilities.forEach(fac => {
      if (fac.polygon) {
        const bg = L.polygon(fac.polygon, { color: fac.color || '#38bdf8', fillOpacity: 0.12, weight: 1.5, dashArray: '3,3' }).addTo(map);
        bg.bindTooltip(`${fac.name}`, { direction: 'center', className: 'area-label-tooltip' });
        devState.mapLayers[`bg-fac-${fac.id}`] = bg;
      }

      fac.equipments.forEach(eq => {
        if (eq.entrance) {
          const pinColor = eq.repairActive && eq.repairStatus !== 'done'
            ? '#f43f5e'
            : (eq.maintStatus === 'done' ? '#10b981' : '#f59e0b');
          const marker = L.circleMarker([eq.entrance.lat, eq.entrance.lng], {
            radius: 9,
            color: '#fff',
            fillColor: pinColor,
            fillOpacity: 0.95,
            weight: 2.5
          }).addTo(map);

          marker.bindTooltip(`<b>[${eq.id}] ${eq.roomName || ''}</b><br>${eq.hvacType || ''}<br><small>${fac.name}</small>`, { direction: 'top' });
          marker.on('click', () => selectItem(`${fac.id}__${eq.id}`));
          devState.mapLayers[`${fac.id}__${eq.id}`] = marker;
        }
      });
    });
  }
}

// =========================================================
// 3. サイドバーのアイテム一覧
// =========================================================

function renderSidebarList() {
  const container = document.getElementById('item-list-container');
  container.innerHTML = '';

  const items = getCurrentLayerItemList();
  document.getElementById('current-layer-item-count').textContent = `${items.length} 件`;

  if (items.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:12px;text-align:center;">登録アイテムがありません。「新規作成」から追加できます</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = `item-card ${devState.selectedItemId === item.id ? 'active' : ''}`;
    card.id = `item-card-${item.id}`;

    const color = item.color || item.fillColor || '#38bdf8';
    const pointsCount = item.polygon ? item.polygon.length : (item.lat ? 1 : 0);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-title-wrap">
          <span class="color-swatch" style="background:${color};"></span>
          <span class="card-name">${item.name || item.roomName || '名称未設定'}</span>
        </div>
        <span class="card-code">${item.code || item.id}</span>
      </div>
      <div class="card-meta">
        <span>${item.parentName || item.category || ''}</span>
        <span><i data-lucide="pentagon" style="width:11px;height:11px;vertical-align:middle;"></i> ${pointsCount}頂点</span>
      </div>
    `;

    card.onclick = () => selectItem(item.id);
    container.appendChild(card);
  });

  lucide.createIcons();
}

function filterItemList() {
  const q = document.getElementById('sidebar-filter-input').value.trim().toLowerCase();
  const cards = document.querySelectorAll('.item-card');

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function getCurrentLayerItemList() {
  const cur = devState.activeLayer;
  if (cur === 'park') return devState.data.parks;
  if (cur === 'area') {
    const parkCountMap = {};
    return devState.data.areas.map(a => {
      parkCountMap[a.parkId] = (parkCountMap[a.parkId] || 0) + 1;
      const num = parkCountMap[a.parkId];
      const park = devState.data.parks.find(p => p.id === a.parkId);
      return { ...a, name: `${num}. ${a.name}`, parentName: park ? park.shortName : '' };
    });
  }
  if (cur === 'facility') {
    return devState.data.facilities.map(f => {
      const area = devState.data.areas.find(a => a.id === f.areaId);
      return { ...f, parentName: area ? area.name : '' };
    });
  }
  if (cur === 'entrance') {
    const list = [];
    devState.data.facilities.forEach(fac => {
      fac.equipments.forEach(eq => {
        const pinColor = eq.repairActive && eq.repairStatus !== 'done'
          ? '#f43f5e'
          : (eq.maintStatus === 'done' ? '#10b981' : '#f59e0b');
        list.push({
          id: `${fac.id}__${eq.id}`,
          name: `${eq.roomName || eq.entrance?.name || '空調機'} (${eq.floor || '1F'})`,
          code: eq.id,
          parentName: `${fac.name} / ${eq.hvacType || ''}`,
          color: pinColor,
          lat: eq.entrance?.lat,
          lng: eq.entrance?.lng
        });
      });
    });
    return list;
  }
  return [];
}

// =========================================================
// 4. アイテム選択 ＆ インスペクター編集
// =========================================================

function selectItem(itemId) {
  devState.selectedItemId = itemId;

  // サイドバーカードのactive更新
  document.querySelectorAll('.item-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`item-card-${itemId}`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 地図レイヤーのハイライト＆フォーカス
  const layer = devState.mapLayers[itemId];
  if (layer) {
    if (layer.getBounds) {
      map.fitBounds(layer.getBounds(), { padding: [80, 80], maxZoom: 18, duration: 0.6 });
    } else if (layer.getLatLng) {
      map.flyTo(layer.getLatLng(), 19, { duration: 0.6 });
    }
  }

  // インスペクターにプロパティをロード
  loadItemIntoInspector(itemId);
}

function findEquipmentByCompositeId(compositeId) {
  if (!compositeId || !compositeId.includes('__')) return null;
  const [facId, eqId] = compositeId.split('__');
  const fac = devState.data.facilities.find(f => f.id === facId);
  if (!fac) return null;
  const eq = fac.equipments.find(e => e.id === eqId);
  if (!eq) return null;
  return { fac, eq };
}

function loadItemIntoInspector(itemId) {
  const form = document.getElementById('edit-form');
  const emptyState = document.querySelector('.inspector-body .empty-message');
  const btnDelete = document.getElementById('btn-delete-item');

  emptyState.style.display = 'none';
  form.classList.remove('hidden');
  btnDelete.removeAttribute('disabled');

  const cur = devState.activeLayer;
  const polyStyleBox = document.getElementById('polygon-style-fields');
  const eqDetailBox = document.getElementById('equipment-detail-fields');
  const facAddEqBox = document.getElementById('facility-add-eq-box');

  if (cur === 'entrance') {
    const found = findEquipmentByCompositeId(itemId);
    if (!found) return;
    const { fac, eq } = found;

    polyStyleBox.style.display = 'none';
    eqDetailBox.style.display = 'flex';
    document.getElementById('group-category').style.display = 'none';

    // 所属建物セレクト
    const parentSelect = document.getElementById('edit-parent-select');
    parentSelect.innerHTML = '';
    devState.data.facilities.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.code || f.id}: ${f.name}`;
      if (f.id === fac.id) opt.selected = true;
      parentSelect.appendChild(opt);
    });
    parentSelect.parentElement.style.display = 'flex';

    // 名称＝設置部屋名、コード＝機器ID
    document.getElementById('edit-name').value = eq.roomName || '';
    document.getElementById('edit-code').value = eq.id || '';

    // 基本機器フィールド
    document.getElementById('eq-floor').value = eq.floor || '1F';
    document.getElementById('eq-count').value = eq.indoorUnitsCount || 1;
    document.getElementById('eq-hvac-type').value = eq.hvacType || '';
    document.getElementById('eq-entrance-name').value = eq.entrance?.name || '';
    document.getElementById('eq-security-key').checked = !!eq.needSecurityKey;
    document.getElementById('eq-security-note').value = eq.securityNote || '';
    document.getElementById('eq-photo-url').value = eq.entrance?.photoUrl || '';
    document.getElementById('eq-notes').value = eq.notes || '';

    // ① 年度整備業務
    document.getElementById('eq-maint-target').checked = eq.maintTarget !== false;
    document.getElementById('eq-maint-status').value = eq.maintStatus || (eq.completed ? 'done' : 'pending');
    document.getElementById('eq-maint-period').value = eq.maintPeriod || '2026年度 (4月〜3月)';
    document.getElementById('eq-maint-note').value = eq.maintNote || '';

    // ② フィルター清掃業務
    document.getElementById('eq-filter-target').checked = eq.filterTarget !== false;
    document.getElementById('eq-filter-status').value = eq.filterStatus || 'pending';
    document.getElementById('eq-filter-quarter').value = eq.filterQuarter || '第3四半期 (10〜12月)';
    document.getElementById('eq-filter-spec').value = eq.filterSpec || '';
    document.getElementById('eq-filter-tool').value = eq.filterToolNote || '';

    // ③ OLC不具合修理案件
    document.getElementById('eq-repair-active').checked = !!eq.repairActive;
    document.getElementById('eq-repair-status').value = eq.repairStatus || 'pending';
    document.getElementById('eq-repair-reqno').value = eq.repairRequestNo || '';
    document.getElementById('eq-repair-symptom').value = eq.repairSymptom || '';
    document.getElementById('eq-repair-action').value = eq.repairAction || '';

    lucide.createIcons();
    return;
  }

  polyStyleBox.style.display = 'block';
  eqDetailBox.style.display = 'none';
  if (facAddEqBox) facAddEqBox.style.display = (cur === 'facility') ? 'block' : 'none';

  let item = null;
  if (cur === 'park') item = devState.data.parks.find(p => p.id === itemId);
  if (cur === 'area') item = devState.data.areas.find(a => a.id === itemId);
  if (cur === 'facility') item = devState.data.facilities.find(f => f.id === itemId);

  if (!item) return;

  // 親選択ドロップダウンの更新
  const parentSelect = document.getElementById('edit-parent-select');
  parentSelect.innerHTML = '';

  if (cur === 'area') {
    devState.data.parks.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.shortName} (${p.name})`;
      if (p.id === item.parkId) opt.selected = true;
      parentSelect.appendChild(opt);
    });
    parentSelect.parentElement.style.display = 'flex';
  } else if (cur === 'facility') {
    devState.data.areas.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.name;
      if (a.id === item.areaId) opt.selected = true;
      parentSelect.appendChild(opt);
    });
    parentSelect.parentElement.style.display = 'flex';
  } else {
    parentSelect.parentElement.style.display = 'none';
  }

  // カテゴリ（施設のみ）
  document.getElementById('group-category').style.display = (cur === 'facility') ? 'flex' : 'none';
  if (item.category) document.getElementById('edit-category').value = item.category;

  // 各フィールド代入
  document.getElementById('edit-name').value = item.name || '';
  document.getElementById('edit-code').value = item.code || item.id || '';
  document.getElementById('edit-desc').value = item.description || '';

  // カラー設定
  const color = item.color || '#3b82f6';
  syncColorInput(color);

  // 透明度
  const opacity = Math.round((item.fillOpacity || 0.25) * 100);
  document.getElementById('edit-opacity').value = opacity;
  document.getElementById('opacity-val').textContent = `${opacity}%`;

  // 頂点数
  const pts = item.polygon ? item.polygon.length : 0;
  document.getElementById('poly-point-count').textContent = pts;

  lucide.createIcons();
}

function clearInspector() {
  document.querySelector('.inspector-body .empty-message').style.display = 'flex';
  document.getElementById('edit-form').classList.add('hidden');
  document.getElementById('btn-delete-item').setAttribute('disabled', 'true');
  disableVertexEditing();
}

// =========================================================
// 5. プロパティの更新・頂点編集・保存
// =========================================================

function syncColorInput(hex) {
  document.getElementById('edit-color').value = hex;
  document.getElementById('edit-color-hex').textContent = hex;
}

function setPresetColor(hex) {
  syncColorInput(hex);
}

function updateOpacityDisplay(val) {
  document.getElementById('opacity-val').textContent = `${val}%`;
}

/**
 * フォームの入力内容をマスターデータに適用
 */
function applyFormChanges() {
  const itemId = devState.selectedItemId;
  if (!itemId) return;

  const cur = devState.activeLayer;

  // L4: 空調機マスターの保存処理
  if (cur === 'entrance') {
    const found = findEquipmentByCompositeId(itemId);
    if (!found) return;
    const { fac, eq } = found;

    const newFacId = document.getElementById('edit-parent-select').value;
    eq.roomName = document.getElementById('edit-name').value.trim() || '空調機械室';
    eq.id = document.getElementById('edit-code').value.trim() || eq.id;
    eq.floor = document.getElementById('eq-floor').value.trim() || '1F';
    eq.indoorUnitsCount = parseInt(document.getElementById('eq-count').value, 10) || 1;
    eq.hvacType = document.getElementById('eq-hvac-type').value.trim() || 'パッケージエアコン';

    if (!eq.entrance) eq.entrance = { lat: fac.lat || 35.632, lng: fac.lng || 139.882 };
    eq.entrance.name = document.getElementById('eq-entrance-name').value.trim() || '保守通用口';
    eq.entrance.photoUrl = document.getElementById('eq-photo-url').value.trim();
    eq.entrance.photoCaption = document.getElementById('eq-security-note').value.trim() || eq.entrance.name;

    eq.needSecurityKey = document.getElementById('eq-security-key').checked;
    eq.securityNote = document.getElementById('eq-security-note').value.trim() || (eq.needSecurityKey ? '要セキュリティ開錠' : '開錠不要');
    eq.notes = document.getElementById('eq-notes').value.trim();

    // ① 年度整備業務
    eq.maintTarget = document.getElementById('eq-maint-target').checked;
    eq.maintStatus = document.getElementById('eq-maint-status').value;
    eq.completed = (eq.maintStatus === 'done');
    eq.maintPeriod = document.getElementById('eq-maint-period').value.trim() || '2026年度';
    eq.maintNote = document.getElementById('eq-maint-note').value.trim();

    // ② フィルター清掃業務
    eq.filterTarget = document.getElementById('eq-filter-target').checked;
    eq.filterStatus = document.getElementById('eq-filter-status').value;
    eq.filterQuarter = document.getElementById('eq-filter-quarter').value.trim() || '第3四半期';
    eq.filterSpec = document.getElementById('eq-filter-spec').value.trim();
    eq.filterToolNote = document.getElementById('eq-filter-tool').value.trim();

    // ③ OLC不具合修理案件
    eq.repairActive = document.getElementById('eq-repair-active').checked;
    eq.repairStatus = document.getElementById('eq-repair-status').value;
    eq.repairRequestNo = document.getElementById('eq-repair-reqno').value.trim();
    eq.repairSymptom = document.getElementById('eq-repair-symptom').value.trim();
    eq.repairAction = document.getElementById('eq-repair-action').value.trim();

    // 所属建物が変更された場合は配列を移動
    let targetFacId = fac.id;
    if (newFacId && newFacId !== fac.id) {
      const targetFac = devState.data.facilities.find(f => f.id === newFacId);
      if (targetFac) {
        fac.equipments = fac.equipments.filter(e => e !== eq);
        targetFac.equipments.push(eq);
        targetFacId = targetFac.id;
      }
    }

    devState.selectedItemId = `${targetFacId}__${eq.id}`;
    renderMapElements();
    renderSidebarList();
    triggerAutoSave();
    showToast(`空調機「${eq.id} (${eq.roomName})」を保存しました`);
    return;
  }

  let item = null;
  if (cur === 'park') item = devState.data.parks.find(p => p.id === itemId);
  if (cur === 'area') item = devState.data.areas.find(a => a.id === itemId);
  if (cur === 'facility') item = devState.data.facilities.find(f => f.id === itemId);

  if (!item) return;

  item.name = document.getElementById('edit-name').value;
  item.code = document.getElementById('edit-code').value;
  item.color = document.getElementById('edit-color').value;
  item.fillColor = item.color;
  item.fillOpacity = parseFloat(document.getElementById('edit-opacity').value) / 100;
  item.description = document.getElementById('edit-desc').value;

  if (cur === 'area') {
    item.parkId = document.getElementById('edit-parent-select').value;
  } else if (cur === 'facility') {
    item.areaId = document.getElementById('edit-parent-select').value;
    item.category = document.getElementById('edit-category').value;
  }

  // 地図レイヤーのスタイルを即時更新
  const layer = devState.mapLayers[itemId];
  if (layer && layer.setStyle) {
    layer.setStyle({
      color: item.color,
      fillColor: item.fillColor,
      fillOpacity: item.fillOpacity
    });
    if (layer.getTooltip()) {
      if (cur === 'area') {
        const parkAreas = devState.data.areas.filter(a => a.parkId === item.parkId);
        const num = parkAreas.findIndex(a => a.id === item.id) + 1;
        layer.setTooltipContent(`<span class="dev-area-num-badge" style="border-color:${item.color};">${num}</span>`);
      } else {
        layer.setTooltipContent(`<b>${item.name}</b>`);
      }
    }
  }

  renderSidebarList();
  triggerAutoSave();
  showToast(`「${item.name}」の変更を適用し自動保存しました`);
}

/**
 * 頂点ドラッグ編集モードの切り替え (Geoman edit mode)
 */
function startVertexEditMode() {
  const itemId = devState.selectedItemId;
  if (!itemId) return;

  const layer = devState.mapLayers[itemId];
  if (!layer || !layer.pm) return;

  if (!devState.isVertexEditing) {
    layer.pm.enable({ allowSelfIntersection: false });
    devState.isVertexEditing = true;
    document.getElementById('btn-edit-vertices').innerHTML = '<i data-lucide="check-check"></i> 頂点編集を終了';
    document.getElementById('btn-edit-vertices').style.background = '#0284c7';
    showToast('地図上の頂点をドラッグして変形できます');

    // 編集終了時に座標を反映
    layer.on('pm:edit', () => {
      const newCoords = layer.getLatLngs()[0].map(ll => [
        parseFloat(ll.lat.toFixed(6)),
        parseFloat(ll.lng.toFixed(6))
      ]);
      saveUpdatedCoordinates(itemId, newCoords);
    });
  } else {
    disableVertexEditing();
  }
  lucide.createIcons();
}

function disableVertexEditing() {
  if (devState.isVertexEditing && devState.selectedItemId) {
    const layer = devState.mapLayers[devState.selectedItemId];
    if (layer && layer.pm) layer.pm.disable();
  }
  devState.isVertexEditing = false;
  const btn = document.getElementById('btn-edit-vertices');
  if (btn) {
    btn.innerHTML = '<i data-lucide="move"></i> 頂点をドラッグ編集';
    btn.style.background = 'var(--bg-card)';
  }
}

function saveUpdatedCoordinates(itemId, coords) {
  const cur = devState.activeLayer;
  let item = null;

  if (cur === 'park') item = devState.data.parks.find(p => p.id === itemId);
  if (cur === 'area') item = devState.data.areas.find(a => a.id === itemId);
  if (cur === 'facility') item = devState.data.facilities.find(f => f.id === itemId);

  if (item) {
    item.polygon = coords;
    document.getElementById('poly-point-count').textContent = coords.length;
    triggerAutoSave();
    showToast(`ポリゴン頂点を更新・自動保存しました (${coords.length}点)`);
  }
}

/**
 * 新規ポリゴンまたは空調機ピン作図モードの開始
 */
function startNewPolygonCreation() {
  if (devState.activeLayer === 'entrance') {
    map.pm.enableDraw('Marker', { snappable: false });
    showToast('空調機・搬入入口を設置する建物を地図上でクリックしてください');
    return;
  }
  map.pm.enableDraw('Polygon', {
    snappable: true,
    snapDistance: 20
  });
  showToast('衛星写真上で頂点をクリックして囲んでください');
}

function handleNewEquipmentPinCreated(lat, lng, targetFacId = null) {
  let parentFac = null;
  if (targetFacId) {
    parentFac = devState.data.facilities.find(f => f.id === targetFacId);
  }
  if (!parentFac && devState.data.facilities.length > 0) {
    // クリック地点に一番近い建物を自動選択
    let bestDist = Infinity;
    devState.data.facilities.forEach(f => {
      const d = Math.hypot((f.lat || 35.632) - lat, (f.lng || 139.882) - lng);
      if (d < bestDist) {
        bestDist = d;
        parentFac = f;
      }
    });
  }
  if (!parentFac) {
    showToast('先にL3で建物を1件以上登録してください');
    return;
  }

  const nextNum = parentFac.equipments.length + 1;
  const newEq = {
    id: `EQ-${(parentFac.code || 'FAC').replace('FAC-', '')}-${String(nextNum).padStart(2, '0')}`,
    floor: '1F',
    entrance: {
      name: '保守通用口',
      lat: lat,
      lng: lng,
      photoUrl: '',
      photoCaption: '保守通用口'
    },
    roomName: '新規空調機械室・設置場所',
    hvacType: 'パッケージエアコン室内機',
    indoorUnitsCount: 1,
    needSecurityKey: false,
    securityNote: '開錠不要',
    notes: '4尺脚立・標準工具',
    completed: false,
    maintTarget: true,
    maintPeriod: '2026年度 (4月〜3月)',
    maintStatus: 'pending',
    maintNote: '定期整備対象',
    filterTarget: true,
    filterQuarter: '第3四半期 (10〜12月)',
    filterSpec: '標準フィルター × 2枚',
    filterToolNote: '4尺脚立',
    filterStatus: 'pending',
    repairActive: false,
    repairRequestNo: '',
    repairSymptom: '',
    repairAction: '',
    repairStatus: 'pending'
  };

  parentFac.equipments.push(newEq);
  updateLayerCounts();
  switchActiveLayer('entrance');
  selectItem(`${parentFac.id}__${newEq.id}`);
  triggerAutoSave();
  showToast(`「${parentFac.name}」に新規空調機 (${newEq.id}) を追加しました！右パネルで詳細を入力してください`);
}

function addEquipmentToSelectedFacility() {
  if (devState.activeLayer !== 'facility' || !devState.selectedItemId) return;
  const fac = devState.data.facilities.find(f => f.id === devState.selectedItemId);
  if (!fac) return;
  const lat = parseFloat((fac.lat || 35.632).toFixed(6));
  const lng = parseFloat((fac.lng || 139.882).toFixed(6));
  handleNewEquipmentPinCreated(lat, lng, fac.id);
}

function handleNewPolygonCreated(latlngs, createdLayer) {
  map.removeLayer(createdLayer); // 一時レイヤーを削除

  const cur = devState.activeLayer;
  const idGen = 'custom_' + Date.now().toString().slice(-5);

  const avgLat = (latlngs.reduce((sum, p) => sum + p[0], 0) / latlngs.length).toFixed(6);
  const avgLng = (latlngs.reduce((sum, p) => sum + p[1], 0) / latlngs.length).toFixed(6);

  if (cur === 'area') {
    const newArea = {
      id: `area-${idGen}`,
      parkId: 'tdl',
      name: '新規保全工区エリア',
      code: `AREA-${devState.data.areas.length + 1}`,
      color: '#ec4899',
      fillColor: '#ec4899',
      fillOpacity: 0.25,
      center: [parseFloat(avgLat), parseFloat(avgLng)],
      zoom: 17,
      polygon: latlngs
    };
    devState.data.areas.push(newArea);
    renderMapElements();
    renderSidebarList();
    selectItem(newArea.id);
    showToast('新規エリアを作成しました！右パネルで名前と色を設定してください');
  } else if (cur === 'facility') {
    const newFac = {
      id: `fac-${idGen}`,
      areaId: devState.data.areas[0]?.id || 'tdl-tomorrow',
      name: '新規建物・設備棟',
      category: 'アトラクション',
      code: `FAC-${devState.data.facilities.length + 1}`,
      color: '#38bdf8',
      fillColor: '#93c5fd',
      lat: parseFloat(avgLat),
      lng: parseFloat(avgLng),
      polygon: latlngs,
      description: '新規登録施設',
      equipments: []
    };
    devState.data.facilities.push(newFac);
    renderMapElements();
    renderSidebarList();
    selectItem(newFac.id);
    showToast('新規施設を作成しました！右パネルで詳細を設定してください');
  }
  updateLayerCounts();
}

/**
 * 選択中アイテムの削除
 */
function deleteSelectedItem() {
  const itemId = devState.selectedItemId;
  if (!itemId) return;

  if (!confirm('このアイテムを削除しますか？')) return;

  const cur = devState.activeLayer;
  if (cur === 'park') devState.data.parks = devState.data.parks.filter(p => p.id !== itemId);
  if (cur === 'area') devState.data.areas = devState.data.areas.filter(a => a.id !== itemId);
  if (cur === 'facility') devState.data.facilities = devState.data.facilities.filter(f => f.id !== itemId);
  if (cur === 'entrance') {
    const found = findEquipmentByCompositeId(itemId);
    if (found) {
      found.fac.equipments = found.fac.equipments.filter(e => e.id !== found.eq.id);
    }
  }

  renderMapElements();
  renderSidebarList();
  clearInspector();
  updateLayerCounts();
  triggerAutoSave();
  showToast('アイテムを削除しました');
}

function updateLayerCounts() {
  document.getElementById('count-park').textContent = devState.data.parks.length;
  document.getElementById('count-area').textContent = devState.data.areas.length;
  document.getElementById('count-facility').textContent = devState.data.facilities.length;

  let eqCount = 0;
  devState.data.facilities.forEach(f => eqCount += f.equipments.length);
  document.getElementById('count-entrance').textContent = eqCount;
}

// =========================================================
// 6. 即時同期 ＆ data.js エクスポート
// =========================================================

/**
 * ブラウザのlocalStorageに即時保存し、本番アプリと自動同期
 */
function saveToLocalStorageAndNotify() {
  triggerAutoSave(true);
}

/**
 * サーバー上の data.js に直接書き込み（PCで編集した内容をスマホへ即時反映）
 */
async function syncToServer(dataObj, isManual = false) {
  try {
    const res = await fetch('/api/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataObj)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.lastUpdated) {
        dataObj.lastUpdated = json.lastUpdated;
        localStorage.setItem('tdr_facility_custom_data', JSON.stringify(dataObj));
      }
      if (isManual) {
        showToast('⚡ PC・スマホすべての本番マップ(data.js)へ完全同期しました！');
      }
    }
  } catch (err) {
    console.warn('サーバー直接保存スキップ(静的環境):', err);
    if (isManual) {
      showToast('⚡ ブラウザに保存しました（別端末へ反映する場合は data.js 出力をご利用ください）');
    }
  }
}

/**
 * リアルタイム・オートセーブ（変更のたびに localStorage ＋ サーバー data.js の両方を自動更新）
 */
function triggerAutoSave(isManual = false) {
  try {
    devState.data.lastUpdated = Date.now();
    localStorage.setItem('tdr_facility_custom_data', JSON.stringify(devState.data));
    
    // ヘッダーの自動保存バッジを更新
    const badge = document.getElementById('autosave-status');
    const timeLabel = document.getElementById('autosave-time');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    if (badge && timeLabel) {
      timeLabel.textContent = `スマホ同期済 (${timeStr})`;
      badge.classList.remove('saving');
    }

    syncToServer(devState.data, isManual);
  } catch (e) {
    console.error('自動保存エラー:', e);
  }
}


/**
 * data.js 用のソースコードをポップアップ表示
 */
function exportDataJsModal() {
  const modal = document.getElementById('export-modal');
  const codeArea = document.getElementById('export-code-area');

  const fullCode = `/**\n * ディズニー空調設備保全マップ - データ定義 (data.js)\n * デベロッパー管理コンソールより出力 (${new Date().toLocaleString()})\n */\n\nconst RESORT_DATA = ${JSON.stringify(devState.data, null, 2)};\n`;

  codeArea.value = fullCode;
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeExportModal() {
  document.getElementById('export-modal').classList.add('hidden');
}

function copyExportCode() {
  const code = document.getElementById('export-code-area').value;
  navigator.clipboard.writeText(code).then(() => {
    showToast('📋 data.js 用コードをクリップボードにコピーしました！');
  });
}

function downloadDataJsFile() {
  const code = document.getElementById('export-code-area').value;
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.js';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 data.js をダウンロードしました');
}

function showToast(msg) {
  const toast = document.getElementById('dev-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
