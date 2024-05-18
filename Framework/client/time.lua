-- ==========| Get Current Time |==========--
local function lua_time()
    return os.time()
end
exports('lua_time', lua_time)