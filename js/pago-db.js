
window.PAYMENT_DB = [
  {
    email: 'stevencarita9818@gmail.com',
    card: '4444 5656 8787 3131',
    exp: '12/34',
    cvc: '123',
    name: 'Steven Carita',
    country: 'AR'
  }
];



window.PAYMENT_COUPONS = [
  {
    code: 'MORFI5',
    discount: 0.05,
    description: 'Cupón demo 5% OFF en TU MORFI WEB'
  },
  {
    code: 'TUWEB5',
    discount: 0.05,
    description: 'Cupón extra 5% OFF (demo)'
  }
];



window.AppDB = (function(){
  const USERS_KEY = "tmw-users";
  const SESSION_KEY = "tmw-current-user";

  function loadUsers(){
    try{
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }

  function saveUsers(list){
    try{
      localStorage.setItem(USERS_KEY, JSON.stringify(list));
    }catch(e){}
  }

  function registerUser(data){
    if (!data || !data.email) return null;
    const users = loadUsers();
    const idx = users.findIndex(u => u.email === data.email);
    const base = {
      nombre: data.nombre || "",
      apellido: data.apellido || "",
      email: data.email,
      password: data.password || "",
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      favoritos: Array.isArray(data.favoritos) ? data.favoritos : [],
      compras: Array.isArray(data.compras) ? data.compras : []
    };
    if (idx !== -1){
      users[idx] = Object.assign({}, users[idx], base);
    }else{
      users.push(base);
    }
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, data.email);
    return base;
  }

  function findUser(email){
    if (!email) return null;
    const users = loadUsers();
    return users.find(u => u.email === email) || null;
  }

  function login(email, password){
    const u = findUser(email);
    if (!u) return false;
    if (u.password && password && u.password !== password) return false;
    localStorage.setItem(SESSION_KEY, email);
    return true;
  }

  function getCurrentUserEmail(){
    return localStorage.getItem(SESSION_KEY) || null;
  }

  function getCurrentUser(){
    const email = getCurrentUserEmail();
    if (!email) return null;
    return findUser(email);
  }

  function updateFavorites(email, favorites){
    if (!email) return;
    const users = loadUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return;
    users[idx].favoritos = Array.isArray(favorites) ? favorites : [];
    saveUsers(users);
  }


  function updateUser(email, data){
    if (!email || !data) return null;
    const users = loadUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return null;

    const updated = Object.assign({}, users[idx], {
      nombre: data.nombre !== undefined ? data.nombre : users[idx].nombre,
      apellido: data.apellido !== undefined ? data.apellido : users[idx].apellido,
      telefono: data.telefono !== undefined ? data.telefono : users[idx].telefono,
      direccion: data.direccion !== undefined ? data.direccion : users[idx].direccion
    });

    users[idx] = updated;
    saveUsers(users);

    
    try{
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw){
        const current = JSON.parse(raw);
        if (current && current.email === email){
          localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        }
      }
    }catch(e){}

    return updated;
  }

  function getFavorites(email){
    const u = findUser(email);
    if (!u || !Array.isArray(u.favoritos)) return [];
    return u.favoritos;
  }

  return {
    loadUsers,
    registerUser,
    findUser,
    login,
    getCurrentUserEmail,
    getCurrentUser,
    updateFavorites,
    updateUser,
    getFavorites
  };
})();



const API_URL = "http://localhost:3008"; 

(function(){
  if (!window.AppDB) return;

  const USERS_KEY = "tmw-users";
  const _origRegisterUser = window.AppDB.registerUser;
  const _origUpdateFavorites = window.AppDB.updateFavorites;
  const _origUpdateUser = window.AppDB.updateUser;

  function loadUsersFromLocal(){
    try{
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }

  function saveUsersToLocal(list){
    try{
      localStorage.setItem(USERS_KEY, JSON.stringify(list));
    }catch(e){}
  }

  
  function syncUsersFromServer(){
    try{
      fetch(API_URL + "/users")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            saveUsersToLocal(data);
          }
        })
        .catch(err => {
          console.warn("No se pudieron sincronizar usuarios desde JSON Server", err);
        });
    }catch(e){
      console.warn("Error general al sincronizar usuarios", e);
    }
  }

 
  function registerUserWithApi(data){
    const usuario = _origRegisterUser ? _origRegisterUser(data) : data;

    try{
      fetch(API_URL + "/users", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(usuario)
      }).then(r => r.json())
        .then(nuevo => {
         
          const lista = loadUsersFromLocal();
          const idx = lista.findIndex(u => u.email === nuevo.email);
          if (idx !== -1) {
            lista[idx] = nuevo;
          } else {
            lista.push(nuevo);
          }
          saveUsersToLocal(lista);
        })
        .catch(err => {
          console.warn("No se pudo guardar usuario en JSON Server", err);
        });
    }catch(e){
      console.warn("Error general al registrar usuario en JSON Server", e);
    }

    return usuario;
  }


 
  function updateUserWithApi(email, data){
    const updated = _origUpdateUser ? _origUpdateUser(email, data) : null;
    if (!updated) return null;

    try{
      const lista = loadUsersFromLocal();
      const idx = lista.findIndex(u => u.email === email);
      if (idx === -1) return updated;

      const user = Object.assign({}, lista[idx], {
        nombre: data.nombre !== undefined ? data.nombre : lista[idx].nombre,
        apellido: data.apellido !== undefined ? data.apellido : lista[idx].apellido,
        telefono: data.telefono !== undefined ? data.telefono : lista[idx].telefono,
        direccion: data.direccion !== undefined ? data.direccion : lista[idx].direccion
      });

      lista[idx] = user;
      saveUsersToLocal(lista);

      if (!user.id) {
        return updated;
      }

      fetch(API_URL + "/users/" + user.id, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          direccion: user.direccion
        })
      }).catch(err => {
        console.warn("No se pudieron actualizar los datos del usuario en JSON Server", err);
      });
    }catch(e){
      console.warn("Error general al actualizar datos de usuario en JSON Server", e);
    }

    return updated;
  }

 
  function updateFavoritesWithApi(email, favorites){
    if (_origUpdateFavorites){
      _origUpdateFavorites(email, favorites);
    }

    try{
      const lista = loadUsersFromLocal();
      const idx = lista.findIndex(u => u.email === email);
      if (idx === -1) return;

      const user = lista[idx];
      user.favoritos = Array.isArray(favorites) ? favorites : [];

    
      lista[idx] = user;
      saveUsersToLocal(lista);

      if (!user.id) {
      
        return;
      }

      fetch(API_URL + "/users/" + user.id, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ favoritos: user.favoritos })
      }).catch(err => {
        console.warn("No se pudieron actualizar favoritos en JSON Server", err);
      });
    }catch(e){
      console.warn("Error general al actualizar favoritos en JSON Server", e);
    }
  }

  
  window.AppDB.registerUser = registerUserWithApi;
  window.AppDB.updateFavorites = updateFavoritesWithApi;
  window.AppDB.updateUser = updateUserWithApi;

  
  syncUsersFromServer();
})();
