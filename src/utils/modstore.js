// Mini-store de moderação no database (QuickYAML). Chaves: warns-<guild>, notes-<guild>, cases-<guild>.
function all(db, kind, guildId) {
    return db.get(`${kind}-${guildId}`) || [];
}
function push(db, kind, guildId, entry) {
    const arr = all(db, kind, guildId);
    const rec = { id: (arr.length ? arr[arr.length - 1].id : 0) + 1, ts: Math.floor(Date.now() / 1000), ...entry };
    arr.push(rec);
    db.set(`${kind}-${guildId}`, arr);
    return rec;
}
function remove(db, kind, guildId, id) {
    const arr = all(db, kind, guildId);
    const next = arr.filter((e) => e.id !== id);
    db.set(`${kind}-${guildId}`, next);
    return next.length !== arr.length;
}
function clear(db, kind, guildId) {
    const n = all(db, kind, guildId).length;
    db.set(`${kind}-${guildId}`, []);
    return n;
}
module.exports = { all, push, remove, clear };
