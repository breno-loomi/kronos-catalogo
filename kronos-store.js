/* KRONOS — camada de dados do catálogo e do painel admin.
   Fonte de verdade: a API do backend. localStorage é só cache de leitura offline. */
(function () {
  'use strict';

  var KEY = 'kronos.catalogo.v2';
  var SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  var PRODUCT_FIELDS = ['brand', 'name', 'cat', 'desc', 'price', 'avail', 'img'];

  var DEV_API_PORT = '3333';

  function apiBase() {
    if (typeof window.KRONOS_API_BASE === 'string') return window.KRONOS_API_BASE.replace(/\/$/, '');
    if (window.location.protocol === 'file:') return 'http://localhost:' + DEV_API_PORT;
    // Dev local: front servido estático (ex. porta 5500) e API em outra porta na mesma
    // máquina. Em produção, com front e API atrás do mesmo domínio, cai no relativo abaixo.
    var host = window.location.hostname;
    var isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalHost && window.location.port !== DEV_API_PORT) {
      return 'http://' + host + ':' + DEV_API_PORT;
    }
    return '';
  }

  function stock(pairs) {
    var o = {};
    SIZES.forEach(function (s) { o[s] = 0; });
    Object.keys(pairs || {}).forEach(function (s) { o[s] = pairs[s]; });
    return o;
  }

  // Usado só como ponto de partida antes da primeira resposta da API (ou se ela cair) —
  // e pelo botão "Restaurar catálogo padrão" do admin.
  var SEED = [
    { id: 'p1', brand: 'On Running', cat: 'lifestyle', name: 'Cloudtilt', desc: 'CloudTec Phase em preto e branco. Passada macia para uso diário.', price: 1590, avail: 'Pronta entrega', img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.56.jpeg', stock: stock({ '39': 2, '40': 3, '41': 1, '42': 2 }) },
    { id: 'p2', brand: 'New Balance', cat: 'lifestyle', name: '9060', desc: 'Camurça cream com entressola ABZORB esculpida.', price: 1290, avail: 'Pronta entrega', img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.55.jpeg', stock: stock({ '38': 1, '40': 2, '42': 4, '43': 1 }) },
    { id: 'p3', brand: 'New Balance', cat: 'lifestyle', name: '530 Moon Daze', desc: 'Mesh off-white com detalhes prata. O clássico dos anos 2000.', price: 899, avail: 'Pronta entrega', img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.56 (2).jpeg', stock: stock({ '36': 2, '37': 3, '38': 2, '39': 1, '40': 2 }) },
    { id: 'p4', brand: 'New Balance', cat: 'lifestyle', name: '530 Mocha', desc: 'Mesh cream com sobreposições marrom e solado ABZORB.', price: 899, avail: 'Pronta entrega', img: 'uploads/WhatsApp Image 2026-08-10 at 20.22.56 (1).jpeg', stock: stock({ '39': 1, '41': 2, '42': 2 }) },
    { id: 'p5', brand: 'Nike', cat: 'corrida', name: 'Pegasus 41', desc: 'Rodagem diária com amortecimento reativo e cabedal em mesh.', price: 899, avail: 'Pronta entrega', img: '', stock: stock({ '40': 2, '41': 3, '42': 3, '43': 2 }) },
    { id: 'p6', brand: 'Adidas', cat: 'corrida', name: 'Adizero SL2', desc: 'Treino de ritmo e prova curta. Entressola Lightstrike Pro.', price: 1099, avail: 'Pronta entrega', img: '', stock: stock({ '39': 1, '40': 1, '42': 2 }) },
    { id: 'p7', brand: 'Nike', cat: 'prova', name: 'Vaporfly 4', desc: 'Placa de carbono full-length. Chega em 15 a 25 dias.', price: 2290, avail: 'Por encomenda', img: '', stock: stock({}) },
    { id: 'p8', brand: 'Adidas', cat: 'lifestyle', name: 'Samba OG', desc: 'Couro pleno flor, uso urbano. Numerações sob encomenda.', price: 749, avail: 'Por encomenda', img: '', stock: stock({}) },
    { id: 'p9', brand: 'New Balance', cat: 'lifestyle', name: '990 v6', desc: 'Fabricação nos EUA. Prazo de 20 a 30 dias.', price: 1890, avail: 'Por encomenda', img: '', stock: stock({}) },
    { id: 'p10', brand: 'On Running', cat: 'trail', name: 'Cloudultra 2', desc: 'Trilha longa, solado Missiongrip. Chega em 15 a 25 dias.', price: 1790, avail: 'Por encomenda', img: '', stock: stock({}) }
  ];

  function readCache() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && Array.isArray(d.products)) return d;
      }
    } catch (e) {}
    return { phone: '5511999999999', products: SEED.map(function (p) { return Object.assign({}, p, { stock: Object.assign({}, p.stock) }); }) };
  }

  function cloneState(data) {
    return {
      phone: data.phone,
      products: data.products.map(function (p) { return Object.assign({}, p, { stock: Object.assign({}, p.stock) }); })
    };
  }

  var state = readCache();
  var productsFetch = null;

  function writeCache(data) {
    state = data;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function emitUpdate() {
    try { window.dispatchEvent(new CustomEvent('kronos:update', { detail: state })); } catch (e) {}
  }

  function emitUnauthorized() {
    try { window.dispatchEvent(new CustomEvent('kronos:unauthorized')); } catch (e) {}
  }

  /* Wrapper de fetch: sempre manda cookie de sessão, sempre lê o corpo de erro no
     formato { error: { code, message } } do backend, e avisa a tela de login em 401. */
  function request(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers);
    if (options.body && typeof options.body === 'string') headers['Content-Type'] = 'application/json';

    return fetch(apiBase() + path, Object.assign({ credentials: 'include' }, options, { headers: headers }))
      .then(function (res) {
        if (res.status === 401) emitUnauthorized();
        if (res.status === 204) return null;
        return res.json().catch(function () { return null; }).then(function (body) {
          if (!res.ok) {
            var message = (body && body.error && body.error.message) || ('Erro ' + res.status);
            var err = new Error(message);
            err.status = res.status;
            err.body = body;
            throw err;
          }
          return body;
        });
      });
  }

  /* Devolve o cache atual na hora (mesmo contrato de antes) e busca a versão fresca em
     paralelo; quando ela chega, atualiza o cache e dispara kronos:update — as telas já
     escutam esse evento e se redesenham sozinhas. */
  function load() {
    if (!productsFetch) {
      productsFetch = Promise.all([request('/api/products'), request('/api/settings')])
        .then(function (results) {
          writeCache({
            phone: (results[1] && results[1].phone) || state.phone,
            products: results[0] || []
          });
        })
        .catch(function () {
          // API fora do ar — mantém o que já está em cache (modo offline).
        })
        .finally(function () {
          productsFetch = null;
          // Sempre avisa quando a tentativa termina (sucesso ou falha) — quem escuta
          // kronos:update usa isso para saber que já pode confiar no cache antes de mutar.
          emitUpdate();
        });
    }
    return state;
  }

  function save(next) {
    var before = cloneState(state);
    var beforeById = {};
    before.products.forEach(function (p) { beforeById[p.id] = p; });

    var nextProducts = next.products || [];
    var nextIds = {};
    nextProducts.forEach(function (p) { nextIds[p.id] = true; });

    var tasks = [];

    if (next.phone !== undefined && next.phone !== before.phone) {
      tasks.push(request('/api/admin/settings', { method: 'PATCH', body: JSON.stringify({ phone: next.phone }) }));
    }

    Object.keys(beforeById).forEach(function (id) {
      if (!nextIds[id]) {
        tasks.push(request('/api/admin/products/' + id, { method: 'DELETE' }));
      }
    });

    nextProducts.forEach(function (p) {
      var prev = beforeById[p.id];

      if (!prev) {
        var tempId = p.id;
        var payload = Object.assign({}, p);
        delete payload.id;
        tasks.push(
          request('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) })
            .then(function (created) {
              var idx = state.products.findIndex(function (x) { return x.id === tempId; });
              if (idx === -1) return;
              var products = state.products.slice();
              products[idx] = created;
              writeCache({ phone: state.phone, products: products });
              emitUpdate();
            })
        );
        return;
      }

      SIZES.forEach(function (size) {
        var prevQty = Number(prev.stock[size]) || 0;
        var nextQty = Number(p.stock[size]) || 0;
        if (prevQty !== nextQty) {
          tasks.push(request('/api/admin/products/' + p.id + '/stock', {
            method: 'PATCH',
            body: JSON.stringify({ size: size, delta: nextQty - prevQty })
          }));
        }
      });

      var patch = {};
      PRODUCT_FIELDS.forEach(function (field) {
        if (p[field] !== prev[field]) patch[field] = p[field];
      });
      if (Object.keys(patch).length > 0) {
        tasks.push(request('/api/admin/products/' + p.id, { method: 'PATCH', body: JSON.stringify(patch) }));
      }
    });

    // Otimista: aplica local + localStorage + kronos:update já, sem esperar a rede —
    // os botões de numeração precisam responder na hora.
    writeCache({ phone: next.phone !== undefined ? next.phone : state.phone, products: nextProducts });
    emitUpdate();

    Promise.all(tasks).catch(function () {
      // Alguma chamada falhou. Não dá pra simplesmente restaurar o snapshot "before": se outro
      // save() começou depois deste e já teve sucesso, voltar para um snapshot antigo apagaria
      // essa mudança mais recente. Em vez disso, resincroniza com a verdade do servidor.
      productsFetch = null;
      load();
    });
  }

  function brl(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  }

  function total(p) {
    return SIZES.reduce(function (a, s) { return a + (Number(p.stock && p.stock[s]) || 0); }, 0);
  }

  function sizesInStock(p) {
    return SIZES.filter(function (s) { return (Number(p.stock && p.stock[s]) || 0) > 0; });
  }

  /* Mensagem de interesse: modelo, tamanho e valor. Gerada no front, como sempre. */
  function waMessage(p, size) {
    var t = size ? ('tamanho ' + size) : 'a numeração a confirmar';
    var pedido = p.avail === 'Por encomenda' ? ' (pedido por encomenda)' : '';
    return 'Olá! Tenho interesse no ' + p.brand + ' ' + p.name + ' — ' + t +
      ', ' + brl(p.price) + pedido + '. Ainda está disponível?';
  }

  function waLink(p, size, phone) {
    return 'https://wa.me/' + (phone || state.phone) + '?text=' + encodeURIComponent(waMessage(p, size));
  }

  function uploadImage(file) {
    var formData = new FormData();
    formData.append('file', file);
    return request('/api/admin/uploads', { method: 'POST', body: formData });
  }

  function login(email, password) {
    return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: password }) });
  }

  function logout() {
    return request('/api/auth/logout', { method: 'POST' });
  }

  function me() {
    return request('/api/auth/me');
  }

  window.KronosStore = {
    KEY: KEY,
    SIZES: SIZES,
    SEED: SEED,
    stock: stock,
    load: load,
    save: save,
    brl: brl,
    total: total,
    sizesInStock: sizesInStock,
    waMessage: waMessage,
    waLink: waLink,
    login: login,
    logout: logout,
    me: me,
    uploadImage: uploadImage
  };
})();
