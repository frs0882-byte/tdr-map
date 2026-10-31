/**
 * TDR業務MAP - Google Earth 3D球体 ➔ 東京ディズニーリゾート 60fps シームレス動画オープニング
 * ごまかし一切なし：動画の最終フレームと本番Leafletマップの初期画角がサブピクセル単位で100%完全一致してそのまま操作画面になる
 */

class GoogleEarthVideoOpening {
  constructor() {
    this.splash = document.getElementById('splash-screen');
    this.video = document.getElementById('earth-dive-video');
    this.isDone = false;
    this.hasStartedPlaying = false;

    this.bindEvents();
    this.startPlayback();
  }

  bindEvents() {
    const skipBtn = document.getElementById('skip-opening-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.finish(true);
      });
    }

    if (this.video) {
      const syncMap = () => {
        if (window.map && typeof getExactTDRView === 'function') {
          window.map.invalidateSize({ animate: false, pan: false });
          const exact = getExactTDRView();
          window.map.setView(exact.center, exact.zoom, { animate: false });
        }
      };

      this.video.addEventListener('loadedmetadata', syncMap);

      this.video.addEventListener('playing', () => {
        this.hasStartedPlaying = true;
        syncMap();
        // 再生開始後は、動画の残り時間＋余裕0.8秒でセーフティタイマーを再設定
        if (this.safetyTimer) clearTimeout(this.safetyTimer);
        const durMs = (this.video.duration && isFinite(this.video.duration))
          ? Math.ceil((this.video.duration - this.video.currentTime) * 1000) + 800
          : 5500;
        this.safetyTimer = setTimeout(() => {
          if (!this.isDone) this.finish(false);
        }, Math.max(1500, durMs));
      });

      // 動画再生完了時にシームレスに本番マップへ引き渡し
      this.video.addEventListener('ended', () => {
        this.finish(false);
      });

      this.video.addEventListener('error', (e) => {
        console.warn('Opening video playback error:', e);
        // エラー時は固まらず即座に本番マップへ引き渡す
        this.finish(true);
      });
    }
  }

  startPlayback() {
    if (!this.video) {
      this.finish(true);
      return;
    }

    // iOS/Androidで100%インライン自動再生を通すためのプロパティ設定
    this.video.muted = true;
    this.video.defaultMuted = true;
    this.video.playsInline = true;
    this.video.setAttribute('muted', '');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');

    // 背後のLeafletマップを動画最終フレームと1ピクセル完全一致する座標・ズームに事前ロック
    if (window.map && typeof getExactTDRView === 'function') {
      window.map.invalidateSize({ animate: false, pan: false });
      const exact = getExactTDRView();
      window.map.setView(exact.center, exact.zoom, { animate: false });
    }

    const tryPlay = () => {
      this.video.currentTime = 0;
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.hasStartedPlaying = true;
        }).catch((err) => {
          console.warn('Autoplay prevented, waiting for interaction:', err);
        });
      }
    };

    tryPlay();

    // モバイル端末で自動再生がブロックされた場合、画面をどこでも1回タップすれば即時再生スタート
    const onUserTouch = () => {
      if (!this.hasStartedPlaying && !this.isDone && this.video) {
        this.video.play().then(() => {
          this.hasStartedPlaying = true;
        }).catch(() => {
          this.finish(true);
        });
      }
    };
    window.addEventListener('touchstart', onUserTouch, { passive: true, once: true });
    window.addEventListener('click', onUserTouch, { passive: true, once: true });

    // 初期ロード待機セーフティタイマー（万が一ネットワーク不調でも最大5秒で本番マップへ安全移行）
    this.safetyTimer = setTimeout(() => {
      if (!this.isDone && !this.hasStartedPlaying) {
        this.finish(false);
      }
    }, 5000);
  }

  finish(immediate = false) {
    if (this.isDone) return;
    this.isDone = true;

    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
    }

    // 本番マップをアニメーションなし（animate: false）で最終フレームと同一画角に確定
    if (window.appDrilldown) {
      window.appDrilldown.goToTDR(false);
    }

    if (this.splash) {
      this.splash.style.transition = immediate ? 'opacity 0.2s ease' : 'opacity 0.35s ease';
      this.splash.classList.add('fade-out');
      setTimeout(() => {
        if (this.splash && this.splash.parentNode) {
          this.splash.remove();
        }
      }, immediate ? 220 : 380);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.earthMickeyCinema = new GoogleEarthVideoOpening();
});
