/**
 * TDR空調保全サテライトマップ - アプリケーション制御 (app.js)
 */

// グローバル状態管理
const state = {
  currentPark: null,
  currentArea: null,
  currentFacility: null,
  currentEntrance: null,
  currentLayer: 'satellite',
  businessMode: 'all',     // 'all' | 'maint' | 'filter' | 'repair'
  mapPinFilter: 'pending', // 'pending' | 'all' | 'none'
  parkLayers: {},
  areaLayers: {},
  facilityLayers: [],
  bizPinMarkers: [],
  entranceMarker: null,
  completedTasks: {} // localStorage保存用
};

let map = null;
let satelliteLayer = null;
let streetsLayer = null;

function isMobileDevice() {
  return window.innerWidth <= 768;
}

function getHeaderHeight() {
  const header = document.getElementById('top-header');
  return header ? header.offsetHeight : 80;
}

// =========================================================
// 1. 初期化処理
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  loadCustomDeveloperData();
  loadCompletedTasks();
  initMap();
  initParkLayers();
  initEventHandlers();
  initSearch();
  initQRCode();
  updateAllBusinessBadges();
  lucide.createIcons();
  
  // オープニングアニメーションが存在しない場合のみ、即座にオートフィット
  const splash = document.getElementById('splash-screen');
  if (!splash) {
    setTimeout(() => {
      appDrilldown.goToTDR();
    }, 200);
  }
});

function ensureEquipmentDefaults(dataObj) {
  if (!dataObj || !dataObj.facilities) return;
  dataObj.facilities.forEach((fac, fi) => {
    (fac.equipments || []).forEach((eq, ei) => {
      if (eq.maintTarget === undefined) eq.maintTarget = true;
      if (!eq.maintStatus) eq.maintStatus = eq.completed ? 'done' : 'pending';
      if (!eq.maintPeriod) eq.maintPeriod = '2026年度 (4月〜3月)';
      if (eq.filterTarget === undefined) eq.filterTarget = true;
      if (!eq.filterStatus) eq.filterStatus = 'pending';
      if (!eq.filterQuarter) eq.filterQuarter = '第3四半期 (10〜12月)';
      if (!eq.filterSpec) eq.filterSpec = '中性能プレフィルター 595×595×50mm × 4枚';
      if (!eq.filterToolNote) eq.filterToolNote = eq.notes || '脚立・標準工具';
      if (eq.repairActive === undefined) eq.repairActive = (fi === 0 && ei === 0);
      if (eq.repairActive && !eq.repairSymptom) {
        eq.repairRequestNo = 'OLC-26-1041';
        eq.repairSymptom = '異音発生（ファン軸受より金属音・OLC施設管理課より点検依頼）';
        eq.repairStatus = 'pending';
      }
    });
  });
}

/**
 * デベロッパー管理コンソールおよびサーバー(data.js)の最新カスタムデータを適用
 */
function loadCustomDeveloperData() {
  try {
    ensureEquipmentDefaults(RESORT_DATA);
    const saved = localStorage.getItem('tdr_facility_custom_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.parks && parsed.areas && parsed.facilities) {
        const serverTs = RESORT_DATA.lastUpdated || 0;
        const localTs = parsed.lastUpdated || 0;
        // スマホに古いキャッシュが残っていても、サーバー(data.js)の方が新しければサーバー側を優先！
        if (localTs >= serverTs && localTs > 0) {
          ensureEquipmentDefaults(parsed);
          Object.assign(RESORT_DATA, parsed);
        }
      }
    }
  } catch (e) {
    console.error('カスタムデータ読み込みエラー:', e);
  }

  // サーバー(/api/data)からリアルタイム最新データを取得して即時反映
  fetch(`/api/data?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(serverData => {
      if (serverData && serverData.parks && serverData.areas && serverData.facilities) {
        ensureEquipmentDefaults(serverData);
        Object.assign(RESORT_DATA, serverData);
        localStorage.setItem('tdr_facility_custom_data', JSON.stringify(RESORT_DATA));
        if (map) {
          Object.values(state.parkLayers).forEach(l => map.removeLayer(l));
          state.parkLayers = {};
          clearAreas();
          clearFacilities();
          initParkLayers();
          syncLayersByZoom();
          updateAllBusinessBadges();
        }
      }
    })
    .catch(() => {});
}

/**
 * ユーザー指定のTDR全体画角（オープニング動画の最終フレームと画面上で1ピクセルの狂いもなく完全一致する座標・ズーム）を算出
 */
function getExactTDRView() {
  const refEl = document.getElementById('earth-dive-video') ||
                document.getElementById('splash-screen') ||
                document.getElementById('app-container');
  const vRect = (refEl && refEl.getBoundingClientRect().width > 0)
    ? refEl.getBoundingClientRect()
    : { left: 0, top: 0, width: window.innerWidth || 390, height: window.innerHeight || 844 };

  // 動画 (720x1280) が vRect に object-fit: cover; object-position: center center で表示される拡大率
  const coverScale = Math.max(vRect.width / 720.0, vRect.height / 1280.0);
  // 720px幅に DELTA_LON = 0.021820° が収まる基準ズーム Z_final = 15.501911
  const exactZoom = 15.501911 + Math.log2(coverScale);
  // 動画最終フレーム中心 (360, 640) ＝ vRect中心の厳密な座標
  const baseCenter = [35.631559, 139.882545];

  if (map) {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      const mRect = mapEl.getBoundingClientRect();
      const videoCenterX = vRect.left + vRect.width * 0.5;
      const videoCenterY = vRect.top + vRect.height * 0.5;
      const mapCenterX = mRect.left + mRect.width * 0.5;
      const mapCenterY = mRect.top + mRect.height * 0.5;
      const offsetX = mapCenterX - videoCenterX;
      const offsetY = mapCenterY - videoCenterY;

      const pt = map.project(baseCenter, exactZoom);
      pt.x += offsetX;
      pt.y += offsetY;
      return {
        center: map.unproject(pt, exactZoom),
        zoom: exactZoom
      };
    }
  }

  return {
    center: [35.629226, 139.882545],
    zoom: exactZoom
  };
}

/**
 * 地図の初期化
 */
function initMap() {
  const cfg = RESORT_DATA.initialView;
  const initialView = getExactTDRView();

  map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    minZoom: cfg.minZoom,
    maxZoom: cfg.maxZoom,
    zoomSnap: 0,  // ★完全連続ズーム（0.0001単位）：オープニング動画最終フレームとの1ピクセル完全一致＆エリア枠最大フィットを実現
    zoomDelta: 0.25,
    zoomControl: false
  });

  // map インスタンス生成直後にヘッダーオフセット込みの正確な座標へ再アライン
  const exact = getExactTDRView();
  map.setView(exact.center, exact.zoom, { animate: false });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // 衛星写真タイル（Esri World Imagery）
  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxNativeZoom: 19,
    maxZoom: 20
  }).addTo(map);

  // 地図タイル（CartoDB Voyager）
  streetsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &amp; CARTO',
    maxZoom: 20
  });

  // グローバル公開（オープニングシネマやコンソールからアクセス可能にする）
  window.map = map;

  // ズームやスクロール（パン）に応じて L1 ⇄ L2 ⇄ L3/L4 を自動切り替え（セマンティック・ズーム）
  map.on('zoomend moveend', () => {
    syncLayersByZoom();
  });
}

function switchMapLayer(type) {
  state.currentLayer = type;
  if (type === 'satellite') {
    map.removeLayer(streetsLayer);
    map.addLayer(satelliteLayer);
    document.getElementById('btn-layer-satellite').classList.add('active');
    document.getElementById('btn-layer-streets').classList.remove('active');
  } else {
    map.removeLayer(satelliteLayer);
    map.addLayer(streetsLayer);
    document.getElementById('btn-layer-streets').classList.add('active');
    document.getElementById('btn-layer-satellite').classList.remove('active');
  }
}

/**
 * Level 1: TDL / TDS パーク境界枠の描画
 */
function initParkLayers() {
  RESORT_DATA.parks.forEach(park => {
    const polygon = L.polygon(park.polygon, {
      color: park.color,
      fillColor: park.color,
      fillOpacity: 0.2,
      weight: 3,
      dashArray: '6, 6'
    }).addTo(map);

    polygon.bindTooltip(`<b>${park.shortName}</b><br>${park.name.split('（')[0]}`, {
      permanent: true,
      direction: 'center',
      className: 'park-label-tooltip'
    });

    polygon.on('click', () => {
      appDrilldown.selectPark(park.id);
    });

    state.parkLayers[park.id] = polygon;
  });
}

// =========================================================
// 2. セマンティック・ズーム（縮尺連動型）＆ タップジャンプ制御
// =========================================================

/**
 * 画面中心座標から現在見ているパーク（TDL or TDS）とエリアを自動判定
 */
function detectActiveContextByMapCenter() {
  if (!map) return { nearestPark: null, activeArea: null };
  const c = map.getCenter();

  // 中心点がどのパークに近いか判定
  let nearestPark = null;
  let minParkDist = Infinity;
  RESORT_DATA.parks.forEach(p => {
    const b = L.polygon(p.polygon).getBounds();
    const pc = b.getCenter();
    const d = Math.hypot(c.lat - pc.lat, c.lng - pc.lng);
    if (d < minParkDist) {
      minParkDist = d;
      nearestPark = p;
    }
  });

  // 中心点が含まれる（または最も近い）エリアを判定
  let activeArea = null;
  let minAreaDist = Infinity;
  RESORT_DATA.areas.forEach(a => {
    const b = L.polygon(a.polygon).getBounds();
    if (b.contains(c)) {
      const ac = b.getCenter();
      const d = Math.hypot(c.lat - ac.lat, c.lng - ac.lng);
      if (d < minAreaDist) {
        minAreaDist = d;
        activeArea = a;
      }
    }
  });

  if (activeArea) {
    const p = RESORT_DATA.parks.find(pk => pk.id === activeArea.parkId);
    if (p) nearestPark = p;
  }

  return { nearestPark, activeArea };
}

/**
 * 現在のズームレベル（縮尺）に応じて、L1（パーク）⇄ L2（全エリア）⇄ L3/L4（全施設・全ピン）を自動切り替え！
 * 隣のエリアや隣のパークにスクロールしても、同じ階層の要素がシームレスにすべて表示される。
 */
function syncLayersByZoom() {
  if (!map) return;
  const z = map.getZoom();
  const baseZ = getExactTDRView().zoom;

  // 縮尺の閾値判定:
  // L1 (広域: リゾート全体) : z < baseZ + 0.35 (約 15.6 未満)
  // L2 (中域: エリア階層)   : baseZ + 0.35 <= z < 16.95
  // L3 (詳細: 施設・機器)   : z >= 16.95
  const isL1 = z < (baseZ + 0.35);
  const isL2 = !isL1 && z < 16.95;
  const isL3 = z >= 16.95;

  const { nearestPark, activeArea } = detectActiveContextByMapCenter();

  if (isL1) {
    // ─── L1: リゾート全体（パーク大枠のみ表示） ───
    state.currentPark = null;
    state.currentArea = null;

    Object.values(state.parkLayers).forEach(l => {
      l.setStyle({ fillOpacity: 0.2, weight: 3 });
      if (!map.hasLayer(l)) l.addTo(map);
    });

    clearAreas();
    clearFacilities();

    const pqs = document.getElementById('park-quick-selector');
    if (pqs) pqs.style.display = 'flex';
    document.getElementById('area-index-panel')?.classList.add('hidden');
    document.getElementById('header-status-label').textContent = 'TDR全体マップ (L1: パーク)';
    updateGuidance('ズームイン または パークをタップしてエリア表示へ');

  } else if (isL2) {
    // ─── L2: エリア階層（TDL・TDSの全エリアを同時に表示、L1枠は非表示） ───
    state.currentPark = nearestPark;
    state.currentArea = null;

    Object.values(state.parkLayers).forEach(l => {
      if (map.hasLayer(l)) map.removeLayer(l);
    });

    ensureAllAreasRendered(false);
    clearFacilities();

    const pqs = document.getElementById('park-quick-selector');
    if (pqs) pqs.style.display = 'none';
    if (nearestPark) {
      updateAreaIndexPanelForPark(nearestPark.id);
      document.getElementById('header-status-label').textContent = `${nearestPark.shortName} エリアマップ (L2)`;
    }
    updateGuidance('さらにズームイン または エリア選択で建物・施設を表示');

  } else if (isL3) {
    // ─── L3/L4: 施設・建物・入口ピン階層（隣のエリアの施設もすべて同時表示！） ───
    state.currentPark = nearestPark;
    state.currentArea = activeArea;

    Object.values(state.parkLayers).forEach(l => {
      if (map.hasLayer(l)) map.removeLayer(l);
    });

    // 背景として全エリアの境界線を薄く表示し、現在地のエリア枠だけ少し強調
    ensureAllAreasRendered(true, activeArea?.id);
    // 全エリアの全施設を同時表示（隣のエリアにスライドしてもそのまま見える！）
    ensureAllFacilitiesRendered();

    const pqs = document.getElementById('park-quick-selector');
    if (pqs) pqs.style.display = 'none';
    if (nearestPark) {
      updateAreaIndexPanelForPark(nearestPark.id, activeArea?.id);
    }
    const areaTitle = activeArea ? `${activeArea.name}` : (nearestPark ? nearestPark.shortName : '詳細');
    document.getElementById('header-status-label').textContent = `${areaTitle} 施設・機器 (L3)`;
    updateGuidance('施設・建物をタップすると空調機リストと入口写真を表示');
  }

  renderBusinessUnitPins();
  updateBreadcrumbs();
}

const appDrilldown = {
  /**
   * Step 1: TDR全体へリセット
   */
  goToTDR(animate = true) {
    state.currentFacility = null;
    clearEntranceMarker();
    closeBottomSheet();

    map.invalidateSize({ animate: false, pan: false });
    const exact = getExactTDRView();
    map.setView(exact.center, exact.zoom, {
      animate: animate,
      duration: animate ? 0.6 : 0
    });
    syncLayersByZoom();
  },

  /**
   * Step 2: パーク（TDLまたはTDS）へズーム
   */
  selectPark(parkId) {
    const park = RESORT_DATA.parks.find(p => p.id === parkId);
    if (!park) return;

    state.currentPark = park;
    state.currentArea = null;
    state.currentFacility = null;
    clearEntranceMarker();
    closeBottomSheet();

    const parkLayer = state.parkLayers[parkId];
    const bounds = parkLayer ? parkLayer.getBounds() : L.polygon(park.polygon).getBounds();

    if (bounds) {
      const headerH = getHeaderHeight();
      map.fitBounds(bounds, {
        paddingTopLeft: [12, headerH + 8],
        paddingBottomRight: [12, 12],
        maxZoom: 16.5,
        animate: true,
        duration: 0.6
      });
    }
  },

  /**
   * Step 3: エリアへズーム（L3施設が見える縮尺へズームイン）
   */
  selectArea(area) {
    if (!area) return;
    state.currentArea = area;
    state.currentFacility = null;
    clearEntranceMarker();
    closeBottomSheet();

    const polyBounds = L.polygon(area.polygon).getBounds();
    const headerH = getHeaderHeight();
    const targetZ = Math.max(
      map.getBoundsZoom(polyBounds, false, L.point(24, headerH + 24)),
      17.25
    );
    map.flyTo(polyBounds.getCenter(), Math.min(targetZ, 18.2), {
      duration: 0.6
    });
  },

  /**
   * Step 4: 施設を選択 → 整備対象機器一覧を展開！
   */
  selectFacility(fac) {
    state.currentFacility = fac;
    clearEntranceMarker();

    const facZoom = Math.max(map.getZoom(), isMobileDevice() ? 18.6 : 18.3);
    map.flyTo([fac.lat, fac.lng], facZoom, { duration: 0.5 });

    openBottomSheet(fac);
    updateGuidance(`【${fac.name}】の整備対象機器・入口写真`);
    updateBreadcrumbs();
  }
};

window.appDrilldown = appDrilldown;

// =========================================================
// 3. マーカー・ポリゴン描画処理（全エリア・全施設のシームレス描画）
// =========================================================

/**
 * 全エリアのポリゴンと番号バッジを描画・スタイル更新
 * @param {boolean} isDetailMode L3詳細モード時は塗りつぶしを薄くして建物を邪魔しないようにする
 * @param {string} activeAreaId 現在中心にあるエリアID
 */
function ensureAllAreasRendered(isDetailMode = false, activeAreaId = null) {
  // パークごとの通し番号 (1, 2, 3...) を計算
  const parkCounts = {};
  const areaNumMap = {};
  RESORT_DATA.areas.forEach(area => {
    parkCounts[area.parkId] = (parkCounts[area.parkId] || 0) + 1;
    areaNumMap[area.id] = parkCounts[area.parkId];
  });

  // 未生成であれば全エリアを生成
  if (Object.keys(state.areaLayers).length !== RESORT_DATA.areas.length) {
    clearAreas();
    RESORT_DATA.areas.forEach(area => {
      const num = areaNumMap[area.id];
      const poly = L.polygon(area.polygon, {
        color: area.color,
        fillColor: area.fillColor || area.color,
        fillOpacity: area.fillOpacity || 0.25,
        weight: 3,
        dashArray: '4, 6'
      }).addTo(map);

      poly.bindTooltip(`<span class="area-num-badge" style="border-color:${area.color};">${num}</span>`, {
        permanent: true,
        direction: 'center',
        className: 'area-num-tooltip'
      });

      poly.on('click', () => {
        appDrilldown.selectArea(area);
      });

      state.areaLayers[area.id] = poly;
    });
  }

  // 縮尺に応じたスタイル調整（L3では背景境界線として薄く表示）
  RESORT_DATA.areas.forEach(area => {
    const poly = state.areaLayers[area.id];
    if (!poly) return;
    if (isDetailMode) {
      const isCurrent = area.id === activeAreaId;
      poly.setStyle({
        fillOpacity: isCurrent ? 0.12 : 0.04,
        weight: isCurrent ? 3 : 1.8
      });
    } else {
      poly.setStyle({
        fillOpacity: area.fillOpacity || 0.25,
        weight: 3
      });
    }
  });
}

/**
 * 左下のスクロール式エリア番号リストを現在のパークに合わせて更新
 */
function updateAreaIndexPanelForPark(parkId, activeAreaId = null) {
  const areas = RESORT_DATA.areas.filter(a => a.parkId === parkId);
  const panel = document.getElementById('area-index-panel');
  const listEl = document.getElementById('area-index-list');
  const titleEl = document.getElementById('area-index-title');
  const park = RESORT_DATA.parks.find(p => p.id === parkId);

  if (!panel || !listEl) return;
  if (areas.length === 0) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');
  if (titleEl) titleEl.textContent = `📍 ${park ? park.shortName : ''} エリア (${areas.length})`;

  // すでに同じパークのリストが描画されていれば active クラスだけ更新
  if (listEl.getAttribute('data-rendered-park') === parkId && listEl.children.length === areas.length) {
    Array.from(listEl.children).forEach(el => {
      const isMatch = el.getAttribute('data-area-id') === activeAreaId;
      el.classList.toggle('active', isMatch);
    });
    return;
  }

  listEl.setAttribute('data-rendered-park', parkId);
  listEl.innerHTML = '';
  areas.forEach((area, idx) => {
    const num = idx + 1;
    const item = document.createElement('div');
    item.className = `area-index-item ${activeAreaId === area.id ? 'active' : ''}`;
    item.setAttribute('data-area-id', area.id);
    item.innerHTML = `
      <span class="area-list-num" style="border-color:${area.color};">${num}</span>
      <span class="area-list-name">${area.name}</span>
    `;
    item.onclick = (e) => {
      e.stopPropagation();
      appDrilldown.selectArea(area);
    };
    listEl.appendChild(item);
  });
}

function toggleAreaIndexCollapse() {
  const panel = document.getElementById('area-index-panel');
  const btn = document.getElementById('area-index-toggle-btn');
  if (!panel) return;
  panel.classList.toggle('collapsed');
  if (btn) {
    btn.textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
  }
}

function clearAreas() {
  Object.values(state.areaLayers).forEach(l => map.removeLayer(l));
  state.areaLayers = {};
  const listEl = document.getElementById('area-index-list');
  if (listEl) listEl.removeAttribute('data-rendered-park');
}

/**
 * 全エリアの施設（アトラクション・バックヤード等）の枠とピンを一括描画
 * （隣のエリアへスクロールしても、同じ階層の施設がすべてそのまま表示される）
 */
function ensureAllFacilitiesRendered() {
  if (state.facilityLayers.length > 0) return;

  RESORT_DATA.facilities.forEach(fac => {
    // 建物枠ポリゴン
    if (fac.polygon) {
      const poly = L.polygon(fac.polygon, {
        color: fac.color,
        fillColor: fac.fillColor || fac.color,
        fillOpacity: 0.42,
        weight: 2.5
      }).addTo(map);

      poly.on('click', () => appDrilldown.selectFacility(fac));
      state.facilityLayers.push(poly);
    }

    // 建物ピンマーカー
    const pinIcon = L.divIcon({
      className: 'custom-facility-pin',
      html: `
        <div class="facility-marker-pin" style="border-color:${fac.color};">
          <i data-lucide="building-2" style="width:14px;height:14px;color:${fac.color};"></i>
          <span>${fac.name}</span>
          <span style="font-size:10px; opacity:0.8;">(${(fac.equipments || []).length}台)</span>
        </div>
      `,
      iconSize: [160, 32],
      iconAnchor: [80, 16]
    });

    const marker = L.marker([fac.lat, fac.lng], { icon: pinIcon }).addTo(map);
    marker.on('click', () => appDrilldown.selectFacility(fac));
    state.facilityLayers.push(marker);
  });

  lucide.createIcons();
}

function clearFacilities() {
  state.facilityLayers.forEach(l => map.removeLayer(l));
  state.facilityLayers = [];
}

// =========================================================
// 4. 整備対象機器一覧シートの描画（ご指定の8項目）
// =========================================================

function openBottomSheet(fac) {
  const sheet = document.getElementById('bottom-sheet');
  const park = RESORT_DATA.parks.find(p => p.id === state.currentPark?.id);
  const area = RESORT_DATA.areas.find(a => a.id === fac.areaId);

  // ヘッダー情報
  document.getElementById('fac-park-badge').textContent = park ? park.shortName : '';
  document.getElementById('fac-area-badge').textContent = area ? area.name : '';
  document.getElementById('fac-cat-badge').textContent = fac.category;
  document.getElementById('fac-title').textContent = fac.name;
  document.getElementById('fac-desc').textContent = fac.description;

  // 機器カード一覧を生成
  renderEquipmentCards(fac);

  // 進捗状況を更新
  updateProgress(fac);

  sheet.classList.remove('collapsed');
  lucide.createIcons();
}

function closeBottomSheet() {
  document.getElementById('bottom-sheet').classList.add('collapsed');
}

/**
 * 機器カード一覧の生成
 * 項目: フロア、入口名(タップでマップ&写真)、部屋名、空調機種類、室内機数、開錠要否、備考、作業完了チェック
 */
function renderEquipmentCards(fac) {
  const container = document.getElementById('equipment-cards-list');
  container.innerHTML = '';

  if (!fac.equipments || fac.equipments.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:12px;">対象空調機の登録がありません</div>';
    return;
  }

  fac.equipments.forEach(eq => {
    const mode = state.businessMode;
    const isCompleted = isUnitDoneInCurrentMode(fac.id, eq);
    const card = document.createElement('div');
    card.className = `eq-item-card ${isCompleted ? 'is-completed' : ''}`;
    card.id = `card-${fac.id}-${eq.id}`;

    // セキュリティ開錠バッジ
    const secHtml = eq.needSecurityKey
      ? `<span class="security-badge sec-key"><i data-lucide="lock"></i> 要開錠 (${eq.securityNote || '鍵必要'})</span>`
      : `<span class="security-badge sec-none"><i data-lucide="unlock"></i> 開錠不要</span>`;

    // 業務別詳細ボックス
    const maintStatusLabel = (eq.maintStatus === 'done' || isTaskCompleted(fac.id, eq.id)) ? '✅ 整備完了' : '⏳ 未着手';
    const filterStatusLabel = eq.filterStatus === 'done' ? '✅ 清掃・取付完了' : '⏳ 未清掃（回収対象）';
    const repairStatusLabel = eq.repairStatus === 'done' ? '✅ 修理完了' : (eq.repairStatus === 'parts_wait' ? '🟣 部品待ち' : '🚨 未着手（要調査）');

    const maintBoxHtml = (mode === 'all' || mode === 'maint') && eq.maintTarget !== false ? `
      <div class="eq-notes-box" style="border-left:3px solid #3b82f6; background:rgba(37,99,235,0.12); margin-top:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
          <b style="color:#93c5fd;">🔧 年度整備 (${eq.maintPeriod || '今年度'}):</b>
          <button class="sp-status-btn ${eq.maintStatus === 'done' ? 'done' : 'pending'}" onclick="cycleUnitModeStatus('${fac.id}', '${eq.id}', 'maint')">${maintStatusLabel}</button>
        </div>
        <div>${eq.maintNote || eq.notes || '定期整備・試運転点検'}</div>
      </div>
    ` : '';

    const filterBoxHtml = (mode === 'all' || mode === 'filter') && eq.filterTarget !== false ? `
      <div class="eq-notes-box" style="border-left:3px solid #06b6d4; background:rgba(6,182,212,0.12); margin-top:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
          <b style="color:#67e8f9;">🚿 フィルター清掃 (${eq.filterQuarter || '四半期'}):</b>
          <button class="sp-status-btn ${eq.filterStatus === 'done' ? 'done' : 'pending'}" onclick="cycleUnitModeStatus('${fac.id}', '${eq.id}', 'filter')">${filterStatusLabel}</button>
        </div>
        <div><b>フィルター形状・枚数:</b> ${eq.filterSpec || '標準フィルター'}</div>
        <div><b>回収用脚立・工具・備考:</b> ${eq.filterToolNote || eq.notes || '標準工具'}</div>
      </div>
    ` : '';

    const repairBoxHtml = (eq.repairActive || mode === 'repair') ? `
      <div class="eq-notes-box" style="border-left:3px solid #f43f5e; background:rgba(244,63,94,0.14); margin-top:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
          <b style="color:#fda4af;">🚨 OLC不具合修理 ${eq.repairRequestNo ? `[${eq.repairRequestNo}]` : ''}:</b>
          <button class="sp-status-btn ${eq.repairStatus || 'pending'}" onclick="cycleUnitModeStatus('${fac.id}', '${eq.id}', 'repair')">${repairStatusLabel}</button>
        </div>
        <div><b>不具合内容:</b> ${eq.repairSymptom || '不具合登録なし'}</div>
        ${eq.repairAction ? `<div><b>処置・手配部品:</b> ${eq.repairAction}</div>` : ''}
      </div>
    ` : '';

    card.innerHTML = `
      <!-- 1. カードヘッダー：完了チェック ＋ フロア ＋ 部屋名 ＋ 開錠要否 -->
      <div class="eq-card-header">
        <div class="eq-check-group" onclick="toggleTaskCompletion('${fac.id}', '${eq.id}')">
          <div class="eq-checkbox-custom">
            <i data-lucide="check"></i>
          </div>
          <div class="eq-title-wrap">
            <span class="floor-tag">${eq.floor}</span>
            <span class="room-title">[${eq.id}] ${eq.roomName}</span>
          </div>
        </div>
        ${secHtml}
      </div>

      <!-- 2. 空調機の種類 ＆ 対象室内機の数 -->
      <div class="eq-hvac-row">
        <span class="hvac-type-name">
          <i data-lucide="fan"></i> ${eq.hvacType}
        </span>
        <span class="indoor-count-badge">台数：${eq.indoorUnitsCount} 台</span>
      </div>

      <!-- 3. 入口名（タップするとマップが表示されピンが表示される・ピンタップで写真） -->
      <div class="entrance-btn-row" onclick="onEntranceClick('${fac.id}', '${eq.id}')">
        <i data-lucide="door-open"></i>
        <span>入口：${eq.entrance?.name || '保守通用口'}</span>
        <span class="entrance-action-hint">
          <i data-lucide="map-pin"></i> 位置・写真を見る
        </span>
      </div>

      <!-- 4. 共通備考 -->
      ${eq.notes ? `
        <div class="eq-notes-box">
          <b>共通備考 / 準備工具・脚立：</b> ${eq.notes}
        </div>
      ` : ''}

      <!-- 5. 3大業務別ステータス＆詳細 -->
      ${maintBoxHtml}
      ${filterBoxHtml}
      ${repairBoxHtml}
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

/**
 * 入口名をタップしたときの動作：
 * 1. 地図上に入口ピンを表示してズーム
 * 2. 入口写真モーダルを開く
 */
function onEntranceClick(facId, eqId) {
  const fac = RESORT_DATA.facilities.find(f => f.id === facId);
  if (!fac) return;
  const eq = fac.equipments.find(e => e.id === eqId);
  if (!eq || !eq.entrance) return;

  state.currentEntrance = eq.entrance;

  // 地図上に入口ピンを表示
  showEntranceOnMap(eq.entrance);

  // 写真モーダルを表示
  openPhotoModal(eq.entrance);
}

/**
 * 地図上に入口ピンを表示してズーム
 */
function showEntranceOnMap(entrance) {
  clearEntranceMarker();

  const entranceIcon = L.divIcon({
    className: 'custom-entrance-pin',
    html: `
      <div class="entrance-marker-pin">
        <i data-lucide="door-open" style="width:14px;height:14px;"></i>
        <span>${entrance.name}</span>
      </div>
    `,
    iconSize: [180, 32],
    iconAnchor: [90, 16]
  });

  state.entranceMarker = L.marker([entrance.lat, entrance.lng], { icon: entranceIcon }).addTo(map);

  // ピンをクリックしたら写真モーダル再表示
  state.entranceMarker.on('click', () => {
    openPhotoModal(entrance);
  });

  // 地図を中央寄せ
  map.flyTo([entrance.lat, entrance.lng], 19, { duration: 0.6 });
  lucide.createIcons();
}

function clearEntranceMarker() {
  if (state.entranceMarker) {
    map.removeLayer(state.entranceMarker);
    state.entranceMarker = null;
  }
}

/**
 * 写真プレビューモーダル
 */
function openPhotoModal(entrance) {
  const modal = document.getElementById('photo-modal');
  document.getElementById('photo-modal-title').textContent = entrance.name;
  document.getElementById('photo-modal-img').src = entrance.photoUrl;
  document.getElementById('photo-modal-caption').textContent = entrance.photoCaption || '写真の登録情報はありません。';

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closePhotoModal() {
  document.getElementById('photo-modal').classList.add('hidden');
}

function closePwaModal() {
  const modal = document.getElementById('pwa-modal');
  if (modal) modal.classList.add('hidden');
}

function focusEntranceOnMap() {
  closePhotoModal();
  if (state.currentEntrance) {
    map.flyTo([state.currentEntrance.lat, state.currentEntrance.lng], 19, { duration: 0.5 });
  }
}

// =========================================================
// 5. 作業完了チェック ＆ 進捗管理 (localStorage)
// =========================================================

function loadCompletedTasks() {
  try {
    const raw = localStorage.getItem('tdr_hvac_completed_tasks');
    if (raw) state.completedTasks = JSON.parse(raw);
  } catch (e) {
    state.completedTasks = {};
  }
}

function saveCompletedTasks() {
  try {
    localStorage.setItem('tdr_hvac_completed_tasks', JSON.stringify(state.completedTasks));
  } catch (e) {}
}

function isTaskCompleted(facId, eqId) {
  const key = `${facId}_${eqId}`;
  return !!state.completedTasks[key];
}

function toggleTaskCompletion(facId, eqId) {
  const key = `${facId}_${eqId}`;
  state.completedTasks[key] = !state.completedTasks[key];
  saveCompletedTasks();

  const card = document.getElementById(`card-${facId}-${eqId}`);
  if (card) {
    card.classList.toggle('is-completed', state.completedTasks[key]);
  }

  const fac = RESORT_DATA.facilities.find(f => f.id === facId);
  if (fac) updateProgress(fac);
}

function updateProgress(fac) {
  if (!fac || !fac.equipments) return;
  const total = fac.equipments.length;
  let done = 0;
  fac.equipments.forEach(eq => {
    if (isTaskCompleted(fac.id, eq.id)) done++;
  });

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progress-text').textContent = `${done} / ${total} 台完了 (${pct}%)`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

// =========================================================
// 6. パンくずナビゲーション更新
// =========================================================
function updateBreadcrumbs() {
  const bcPark = document.getElementById('bc-park');
  const bcArea = document.getElementById('bc-area');
  const bcFac = document.getElementById('bc-facility');

  if (state.currentPark) {
    bcPark.style.display = 'flex';
    bcPark.querySelector('.bc-label').textContent = state.currentPark.shortName;
    bcPark.onclick = () => appDrilldown.selectPark(state.currentPark.id);
  } else {
    bcPark.style.display = 'none';
  }

  if (state.currentArea) {
    bcArea.style.display = 'flex';
    bcArea.querySelector('.bc-label').textContent = state.currentArea.name;
    bcArea.onclick = () => appDrilldown.selectArea(state.currentArea);
  } else {
    bcArea.style.display = 'none';
  }

  if (state.currentFacility) {
    bcFac.style.display = 'flex';
    bcFac.querySelector('.bc-label').textContent = state.currentFacility.name;
    bcFac.onclick = () => appDrilldown.selectFacility(state.currentFacility);
  } else {
    bcFac.style.display = 'none';
  }
}

function updateGuidance(text) {
  const el = document.getElementById('guidance-text');
  if (el) el.textContent = text;
}

// =========================================================
// 7. 検索機能・QR・各種イベント
// =========================================================
function initEventHandlers() {
  document.getElementById('reset-view-btn').addEventListener('click', () => {
    appDrilldown.goToTDR();
  });

  document.getElementById('sheet-close-btn').addEventListener('click', () => {
    closeBottomSheet();
  });

  // PWAガイドモーダル ＆ 直接インストールトリガー
  const pwaBtn = document.getElementById('pwa-guide-btn');
  const pwaModal = document.getElementById('pwa-modal');
  if (pwaBtn) {
    pwaBtn.addEventListener('click', () => {
      // Android Chromeでインストール可能な場合は直接インストールプロンプトを起動
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('ユーザーがアプリインストールを承認しました');
          }
          window.deferredPrompt = null;
        });
      } else if (pwaModal) {
        pwaModal.classList.remove('hidden');
      }
    });
  }

  // 検索パネル
  const searchPanel = document.getElementById('search-panel');
  const searchInput = document.getElementById('global-search-input');

  document.getElementById('search-toggle-btn').addEventListener('click', () => {
    searchPanel.classList.toggle('hidden');
    if (!searchPanel.classList.contains('hidden')) searchInput.focus();
  });

  document.getElementById('search-close-btn').addEventListener('click', () => {
    searchPanel.classList.add('hidden');
    searchInput.value = '';
    document.getElementById('search-results-list').innerHTML = '';
  });
}

function initSearch() {
  const input = document.getElementById('global-search-input');
  const container = document.getElementById('search-results-list');

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    container.innerHTML = '';
    if (!q) return;

    const matched = [];

    RESORT_DATA.facilities.forEach(fac => {
      const area = RESORT_DATA.areas.find(a => a.id === fac.areaId);
      const park = RESORT_DATA.parks.find(p => p.id === area?.parkId);

      // 施設名
      if (fac.name.toLowerCase().includes(q) || fac.code.toLowerCase().includes(q)) {
        matched.push({
          title: fac.name,
          subtitle: `${park?.shortName} / ${area?.code}`,
          tag: '施設',
          action: () => {
            appDrilldown.selectPark(park.id);
            setTimeout(() => {
              appDrilldown.selectArea(area);
              setTimeout(() => appDrilldown.selectFacility(fac), 300);
            }, 300);
          }
        });
      }

      // 機器・部屋・入口・備考
      fac.equipments.forEach(eq => {
        if (
          eq.roomName.toLowerCase().includes(q) ||
          eq.hvacType.toLowerCase().includes(q) ||
          eq.entrance.name.toLowerCase().includes(q) ||
          (eq.notes && eq.notes.toLowerCase().includes(q))
        ) {
          matched.push({
            title: `${eq.roomName} (${eq.floor}) - ${eq.hvacType}`,
            subtitle: `${fac.name} / 入口: ${eq.entrance.name}`,
            tag: '空調設備',
            action: () => {
              appDrilldown.selectPark(park.id);
              setTimeout(() => {
                appDrilldown.selectArea(area);
                setTimeout(() => {
                  appDrilldown.selectFacility(fac);
                  setTimeout(() => {
                    const el = document.getElementById(`card-${fac.id}-${eq.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 400);
                }, 300);
              }, 300);
            }
          });
        }
      });
    });

    if (matched.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px;">該当する施設や設備は見つかりませんでした</div>';
      return;
    }

    matched.slice(0, 8).forEach(res => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:13px; font-weight:700; color:#fff;">${res.title}</span>
          <span style="font-size:11px; color:var(--text-secondary);">${res.subtitle}</span>
        </div>
        <span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa;">${res.tag}</span>
      `;
      item.onclick = () => {
        res.action();
        document.getElementById('search-panel').classList.add('hidden');
      };
      container.appendChild(item);
    });
  });
}

function initQRCode() {
  const qrBtn = document.getElementById('qr-toggle-btn');
  const qrModal = document.getElementById('qr-modal');
  const qrClose = document.getElementById('qr-modal-close');
  const qrBox = document.getElementById('qrcode-box');
  const qrLink = document.getElementById('qr-url-link');

  let targetUrl = window.location.href;
  if (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
    targetUrl = 'https://else-quiz-drew-lease.trycloudflare.com/';
  }

  qrLink.href = targetUrl;
  qrLink.textContent = targetUrl;

  let qrDone = false;
  qrBtn.addEventListener('click', () => {
    qrModal.classList.toggle('hidden');
    if (!qrModal.classList.contains('hidden') && !qrDone) {
      qrBox.innerHTML = '';
      new QRCode(qrBox, {
        text: targetUrl,
        width: 150,
        height: 150,
        colorDark: "#0b1120",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
      qrDone = true;
    }
  });

  qrClose.addEventListener('click', () => {
    qrModal.classList.add('hidden');
  });

  const launcherBtn = document.getElementById('mode-launcher-btn');
  if (launcherBtn) {
    launcherBtn.addEventListener('click', () => openModeLauncher());
  }

  const sheetTableBtn = document.getElementById('open-sheet-table-btn');
  if (sheetTableBtn) {
    sheetTableBtn.addEventListener('click', () => openSpreadsheetModal());
  }
}

// =========================================================
// 8. 3大業務モード（①年度整備・②四半期フィルター清掃・③OLC不具合修理）
//    ＆ スプレッドシート進捗管理・OLC提出チェックリスト印刷エンジン
// =========================================================

function persistResortDataToLocal() {
  try {
    RESORT_DATA.lastUpdated = Date.now();
    localStorage.setItem('tdr_facility_custom_data', JSON.stringify(RESORT_DATA));
    fetch('/api/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(RESORT_DATA)
    }).catch(() => {});
  } catch (e) {}
}

function isUnitDoneInCurrentMode(facId, eq, mode = state.businessMode) {
  if (mode === 'filter') return eq.filterStatus === 'done';
  if (mode === 'repair') return eq.repairStatus === 'done';
  return eq.maintStatus === 'done' || isTaskCompleted(facId, eq.id);
}

function getAllUnitsFlattened() {
  const rows = [];
  RESORT_DATA.facilities.forEach(fac => {
    const area = RESORT_DATA.areas.find(a => a.id === fac.areaId);
    const park = RESORT_DATA.parks.find(p => p.id === area?.parkId);
    (fac.equipments || []).forEach(eq => {
      rows.push({ park, area, fac, eq });
    });
  });
  return rows;
}

function getModeStats(mode) {
  const all = getAllUnitsFlattened();
  let targets = all;
  if (mode === 'maint') targets = all.filter(r => r.eq.maintTarget !== false);
  if (mode === 'filter') targets = all.filter(r => r.eq.filterTarget !== false);
  if (mode === 'repair') targets = all.filter(r => r.eq.repairActive);

  let total = targets.length;
  let done = targets.filter(r => isUnitDoneInCurrentMode(r.fac.id, r.eq, mode)).length;
  let rem = total - done;
  let rate = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, rem, rate, targets };
}

function updateAllBusinessBadges() {
  const m = getModeStats('maint');
  const f = getModeStats('filter');
  const r = getModeStats('repair');

  const bm = document.getElementById('badge-maint-rem');
  const bf = document.getElementById('badge-filter-rem');
  const br = document.getElementById('badge-repair-rem');
  if (bm) bm.textContent = `${m.rem}`;
  if (bf) bf.textContent = `${f.rem}`;
  if (br) br.textContent = `${r.rem}`;

  const lm = document.getElementById('launcher-stat-maint');
  const lf = document.getElementById('launcher-stat-filter');
  const lr = document.getElementById('launcher-stat-repair');
  if (lm) lm.textContent = `対象 ${m.total}件 / 完了 ${m.done}件 / 残数 ${m.rem}件 (${m.rate}%)`;
  if (lf) lf.textContent = `対象 ${f.total}件 / 完了 ${f.done}件 / 残数 ${f.rem}件 (${f.rate}%)`;
  if (lr) lr.textContent = `発生中（未完了） ${r.rem}件 / 完了 ${r.done}件`;

  updateBizControlStrip();
}

function openModeLauncher() {
  updateAllBusinessBadges();
  const modal = document.getElementById('mode-launcher-modal');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeModeLauncher() {
  const modal = document.getElementById('mode-launcher-modal');
  if (modal) modal.classList.add('hidden');
}

function switchBusinessMode(mode) {
  state.businessMode = mode;

  document.querySelectorAll('.biz-mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });

  const strip = document.getElementById('biz-control-strip');
  if (strip) {
    if (mode === 'all') {
      strip.classList.add('hidden');
    } else {
      strip.classList.remove('hidden');
    }
  }

  const spModeSelect = document.getElementById('sp-filter-mode');
  if (spModeSelect && spModeSelect.value !== mode) {
    spModeSelect.value = mode;
  }

  updateAllBusinessBadges();
  renderBusinessUnitPins();

  if (state.currentFacility) {
    renderEquipmentCards(state.currentFacility);
    updateProgress(state.currentFacility);
  }
  if (!document.getElementById('spreadsheet-modal')?.classList.contains('hidden')) {
    renderSpreadsheetTable();
  }
}

function updateBizControlStrip() {
  const mode = state.businessMode;
  if (mode === 'all') return;

  const titles = {
    maint: '🔧 今年度整備 (4月〜3月)',
    filter: '🚿 四半期フィルター清掃',
    repair: '🚨 OLC不具合修理案件'
  };
  const st = getModeStats(mode);
  const titleEl = document.getElementById('biz-strip-title');
  const statsEl = document.getElementById('biz-strip-stats');
  if (titleEl) titleEl.textContent = titles[mode] || '';
  if (statsEl) statsEl.textContent = `残 ${st.rem} / 全 ${st.total} 件 (${st.rate}%完了)`;
}

function setMapPinFilter(filterType) {
  state.mapPinFilter = filterType;
  ['pending', 'all', 'none'].forEach(k => {
    const el = document.getElementById(`pin-filter-${k}`);
    if (el) el.classList.toggle('active', k === filterType);
  });
  renderBusinessUnitPins();
}

function clearBusinessUnitPins() {
  state.bizPinMarkers.forEach(m => map.removeLayer(m));
  state.bizPinMarkers = [];
}

function renderBusinessUnitPins() {
  clearBusinessUnitPins();
  const mode = state.businessMode;
  if (mode === 'all' || state.mapPinFilter === 'none') return;

  const { targets } = getModeStats(mode);
  targets.forEach(({ park, area, fac, eq }) => {
    const done = isUnitDoneInCurrentMode(fac.id, eq, mode);
    if (state.mapPinFilter === 'pending' && done) return;

    const lat = eq.entrance?.lat || fac.lat;
    const lng = eq.entrance?.lng || fac.lng;
    if (!lat || !lng) return;

    let statusClass = done ? 'status-done' : 'status-pending';
    let iconEmoji = done ? '✅' : (mode === 'filter' ? '🚿' : '🔧');
    if (mode === 'repair' && !done) {
      statusClass = 'status-repair';
      iconEmoji = eq.repairStatus === 'parts_wait' ? '🟣' : '🚨';
    }

    const pinIcon = L.divIcon({
      className: 'custom-biz-unit-pin',
      html: `
        <div class="biz-unit-pin-wrap ${statusClass}">
          <span>${iconEmoji}</span>
          <span>${eq.id}</span>
          <span style="opacity:0.85;font-weight:600;">${eq.roomName.slice(0, 7)}</span>
        </div>
      `,
      iconSize: [140, 26],
      iconAnchor: [70, 13]
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    marker.on('click', () => {
      appDrilldown.selectFacility(fac);
      setTimeout(() => {
        const el = document.getElementById(`card-${fac.id}-${eq.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
    });
    state.bizPinMarkers.push(marker);
  });
}

function cycleUnitModeStatus(facId, eqId, mode) {
  const fac = RESORT_DATA.facilities.find(f => f.id === facId);
  if (!fac) return;
  const eq = fac.equipments.find(e => e.id === eqId);
  if (!eq) return;

  if (mode === 'maint') {
    const curDone = eq.maintStatus === 'done' || isTaskCompleted(facId, eqId);
    eq.maintStatus = curDone ? 'pending' : 'done';
    eq.completed = !curDone;
    state.completedTasks[`${facId}_${eqId}`] = !curDone;
    saveCompletedTasks();
  } else if (mode === 'filter') {
    eq.filterStatus = (eq.filterStatus === 'done') ? 'pending' : 'done';
  } else if (mode === 'repair') {
    eq.repairActive = true;
    const order = ['pending', 'parts_wait', 'done'];
    const idx = order.indexOf(eq.repairStatus || 'pending');
    eq.repairStatus = order[(idx + 1) % order.length];
  }

  persistResortDataToLocal();
  updateAllBusinessBadges();
  renderBusinessUnitPins();

  if (state.currentFacility && state.currentFacility.id === facId) {
    renderEquipmentCards(fac);
    updateProgress(fac);
  }
  if (!document.getElementById('spreadsheet-modal')?.classList.contains('hidden')) {
    renderSpreadsheetTable();
  }
}

function openSpreadsheetModal() {
  const modal = document.getElementById('spreadsheet-modal');
  if (!modal) return;
  const spModeSelect = document.getElementById('sp-filter-mode');
  if (spModeSelect) {
    spModeSelect.value = state.businessMode === 'all' ? 'maint' : state.businessMode;
  }
  modal.classList.remove('hidden');
  renderSpreadsheetTable();
  lucide.createIcons();
}

function closeSpreadsheetModal() {
  const modal = document.getElementById('spreadsheet-modal');
  if (modal) modal.classList.add('hidden');
}

function getFilteredSpreadsheetRows() {
  const mode = document.getElementById('sp-filter-mode')?.value || 'maint';
  const parkFilter = document.getElementById('sp-filter-park')?.value || 'all';
  const statusFilter = document.getElementById('sp-filter-status')?.value || 'all';
  const q = (document.getElementById('sp-search-input')?.value || '').trim().toLowerCase();

  const { targets, total, done, rem, rate } = getModeStats(mode);
  const filtered = targets.filter(({ park, area, fac, eq }) => {
    if (parkFilter !== 'all' && park?.id !== parkFilter) return false;
    const isDone = isUnitDoneInCurrentMode(fac.id, eq, mode);
    if (statusFilter === 'pending' && isDone) return false;
    if (statusFilter === 'done' && !isDone) return false;

    if (q) {
      const hay = [
        park?.shortName, area?.name, fac.name, eq.id, eq.roomName, eq.floor,
        eq.hvacType, eq.notes, eq.filterSpec, eq.filterToolNote,
        eq.repairRequestNo, eq.repairSymptom, eq.repairAction
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return { mode, filtered, total, done, rem, rate };
}

function renderSpreadsheetTable() {
  const { mode, filtered, total, done, rem, rate } = getFilteredSpreadsheetRows();

  // KPI更新
  document.getElementById('sp-kpi-total').textContent = `${total} 件`;
  document.getElementById('sp-kpi-done').textContent = `${done} 件`;
  document.getElementById('sp-kpi-rem').textContent = `${rem} 件`;
  document.getElementById('sp-kpi-rate').textContent = `${rate}%`;

  const modeMeta = {
    maint: { badge: '🔧 ① 年度整備業務 (4月〜3月)', title: '今年度 定期整備対象 空調機進捗管理表', printTitle: '東京ディズニーリゾート 年度定期整備業務 作業進捗・完了報告書' },
    filter: { badge: '🚿 ② 四半期フィルター清掃', title: '四半期 フィルター回収・洗浄チェックリスト（兼OLC提出エビデンス）', printTitle: '東京ディズニーリゾート 四半期フィルター清掃業務 作業完了チェックリスト（エビデンス）' },
    repair: { badge: '🚨 ③ OLC不具合修理業務', title: 'OLC依頼 不具合点検・修理案件管理シート', printTitle: '東京ディズニーリゾート 空調設備 不具合点検・修理対応一覧表' },
    all: { badge: '🗺️ 全空調機マスター', title: '担当空調機 全件マスター台帳', printTitle: '東京ディズニーリゾート 担当空調設備 マスター台帳' }
  }[mode];

  document.getElementById('sp-mode-badge').textContent = modeMeta.badge;
  document.getElementById('sp-modal-title').textContent = modeMeta.title;
  document.getElementById('print-doc-title').textContent = modeMeta.printTitle;
  document.getElementById('print-doc-date').textContent = `出力日時: ${new Date().toLocaleDateString('ja-JP')}`;
  document.getElementById('print-doc-summary').textContent = `対象総数: ${total}件 ／ 完了数: ${done}件 ／ 残数(未完了): ${rem}件 （達成率: ${rate}%）`;

  const addRepairBtn = document.getElementById('sp-btn-add-repair');
  if (addRepairBtn) addRepairBtn.classList.toggle('hidden', mode !== 'repair');

  const thead = document.getElementById('sp-table-head');
  const tbody = document.getElementById('sp-table-body');

  if (mode === 'filter') {
    thead.innerHTML = `
      <tr>
        <th>状態チェック</th>
        <th>機器番号</th>
        <th>パーク / エリア</th>
        <th>建物・施設名</th>
        <th>階・設置部屋</th>
        <th>機種・台数</th>
        <th>フィルター形状・寸法・枚数</th>
        <th>必要な脚立・工具・入室鍵備考</th>
        <th class="no-print">マップ</th>
      </tr>
    `;
  } else if (mode === 'repair') {
    thead.innerHTML = `
      <tr>
        <th>修理ステータス</th>
        <th>OLC依頼No</th>
        <th>機器番号</th>
        <th>建物・設置部屋</th>
        <th>機種区分</th>
        <th>不具合症状・OLC依頼内容</th>
        <th>原因・手配部品・処置メモ</th>
        <th class="no-print">マップ</th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr>
        <th>整備ステータス</th>
        <th>機器番号</th>
        <th>パーク / エリア</th>
        <th>建物・施設名</th>
        <th>階・設置部屋</th>
        <th>機械の種類（機種）</th>
        <th>台数</th>
        <th>整備内容・必要工具・鍵備考</th>
        <th class="no-print">マップ</th>
      </tr>
    `;
  }

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:#94a3b8;">条件に一致する空調機データがありません</td></tr>`;
    return;
  }

  filtered.forEach(({ park, area, fac, eq }) => {
    const isDone = isUnitDoneInCurrentMode(fac.id, eq, mode);
    const tr = document.createElement('tr');
    if (isDone) tr.className = 'row-done';

    const keyInfo = eq.needSecurityKey ? `🔑${eq.securityNote}` : '🔓開錠不要';

    if (mode === 'filter') {
      const stLabel = isDone ? '☑ 清掃完了' : '☐ 未清掃';
      tr.innerHTML = `
        <td><button class="sp-status-btn ${isDone ? 'done' : 'pending'}" onclick="cycleUnitModeStatus('${fac.id}', '${eq.id}', 'filter')">${stLabel}</button></td>
        <td><b>${eq.id}</b></td>
        <td>${park?.shortName || ''} / ${area?.name || ''}</td>
        <td><b>${fac.name}</b></td>
        <td>${eq.floor} ${eq.roomName}<br><small style="color:#94a3b8;">入口: ${eq.entrance?.name || ''}</small></td>
        <td>${eq.hvacType} (${eq.indoorUnitsCount}台)</td>
        <td><b style="color:#67e8f9;">${eq.filterSpec || '標準フィルター'}</b></td>
        <td>${eq.filterToolNote || eq.notes || ''}<br><small>${keyInfo}</small></td>
        <td class="no-print"><button class="sp-jump-btn" onclick="jumpToUnitFromSheet('${fac.id}', '${eq.id}')">📍地図</button></td>
      `;
    } else if (mode === 'repair') {
      const st = eq.repairStatus || 'pending';
      const stLabel = st === 'done' ? '☑ 修理完了' : (st === 'parts_wait' ? '🟣 部品待ち' : '🚨 未着手');
      tr.innerHTML = `
        <td><button class="sp-status-btn ${st}" onclick="cycleUnitModeStatus('${fac.id}', '${eq.id}', 'repair')">${stLabel}</button></td>
        <td><b>${eq.repairRequestNo || 'スポット依頼'}</b></td>
        <td><b>${eq.id}</b></td>
        <td><b>${fac.name}</b><br>${eq.floor} ${eq.roomName}</td>
        <td>${eq.hvacType} (${eq.indoorUnitsCount}台)</td>
        <td><b style="color:#fda4af;">${eq.repairSymptom || ''}</b></td>
        <td>${eq.repairAction || '未記入'}<br><small>${keyInfo}</small></td>
        <td class="no-print"><button class="sp-jump-btn" onclick="jumpToUnitFromSheet('${fac.id}', '${eq.id}')">📍地図</button></td>
      `;
    } else {
      const stLabel = isDone ? '☑ 整備完了' : '☐ 未着手';
      tr.innerHTML = `
        <td><button class="sp-status-btn ${isDone ? 'done' : 'pending'}" onclick="cycleUnitModeStatus('${fac.id}', '${eq.id}', 'maint')">${stLabel}</button></td>
        <td><b>${eq.id}</b></td>
        <td>${park?.shortName || ''} / ${area?.name || ''}</td>
        <td><b>${fac.name}</b></td>
        <td>${eq.floor} ${eq.roomName}</td>
        <td>${eq.hvacType}</td>
        <td>${eq.indoorUnitsCount} 台</td>
        <td>${eq.maintNote || eq.notes || ''}<br><small>${keyInfo} / 入口:${eq.entrance?.name || ''}</small></td>
        <td class="no-print"><button class="sp-jump-btn" onclick="jumpToUnitFromSheet('${fac.id}', '${eq.id}')">📍地図</button></td>
      `;
    }
    tbody.appendChild(tr);
  });
}

function jumpToUnitFromSheet(facId, eqId) {
  closeSpreadsheetModal();
  const fac = RESORT_DATA.facilities.find(f => f.id === facId);
  if (!fac) return;
  const area = RESORT_DATA.areas.find(a => a.id === fac.areaId);
  const park = RESORT_DATA.parks.find(p => p.id === area?.parkId);
  if (park) appDrilldown.selectPark(park.id);
  if (area) appDrilldown.selectArea(area);
  appDrilldown.selectFacility(fac);
  setTimeout(() => {
    const el = document.getElementById(`card-${facId}-${eqId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);
}

function promptNewRepairCase() {
  const all = getAllUnitsFlattened();
  if (all.length === 0) return;
  const eqIdInput = prompt(
    'OLCから不具合依頼があった機器番号を入力してください（例: EQ-101-01, EQ-BY-02）：',
    all[0].eq.id
  );
  if (!eqIdInput) return;
  const target = all.find(r => r.eq.id.toLowerCase() === eqIdInput.trim().toLowerCase()) || all[0];
  const symptom = prompt(`【${target.fac.name} / ${target.eq.roomName}】の不具合症状・依頼内容を入力してください：`, '冷房効かず・異音点検依頼');
  if (!symptom) return;
  const reqNo = prompt('OLC依頼番号（任意）：', `OLC-26-${Math.floor(1000 + Math.random() * 9000)}`);

  target.eq.repairActive = true;
  target.eq.repairStatus = 'pending';
  target.eq.repairSymptom = symptom;
  target.eq.repairRequestNo = reqNo || '';
  target.eq.repairAction = '現地調査予定';

  persistResortDataToLocal();
  switchBusinessMode('repair');
  renderSpreadsheetTable();
}

function exportSpreadsheetCSV() {
  const { mode, filtered } = getFilteredSpreadsheetRows();
  const headers = ['業務区分', 'ステータス', '機器番号', 'パーク', 'エリア', '建物名', '階', '設置部屋', '機種', '台数', '入口名', '鍵備考', 'フィルター仕様', '工具・脚立・整備備考', 'OLC不具合内容'];
  const csvRows = [headers.join(',')];

  filtered.forEach(({ park, area, fac, eq }) => {
    const done = isUnitDoneInCurrentMode(fac.id, eq, mode);
    const statusStr = done ? '完了' : (mode === 'repair' && eq.repairStatus === 'parts_wait' ? '部品待ち' : '未着手');
    const cols = [
      mode,
      statusStr,
      eq.id,
      park?.shortName || '',
      area?.name || '',
      fac.name,
      eq.floor,
      eq.roomName,
      eq.hvacType,
      eq.indoorUnitsCount,
      eq.entrance?.name || '',
      eq.securityNote || '',
      eq.filterSpec || '',
      eq.filterToolNote || eq.notes || '',
      eq.repairSymptom || ''
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`);
    csvRows.push(cols.join(','));
  });

  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TDR_HVAC_${mode}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
