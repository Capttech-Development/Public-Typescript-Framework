-- ==========| CONFIG |==========--
local allPolyZones = { }


-- ==========| CREATE BOX |==========--
local function createBoxZone(id, location, length, width, minZ, maxZ, callbackIn, callbackOut, debugMode)
    local currentState = false
    local boxZone = BoxZone:Create(vector3(location.x, location.y, location.z), length, width, {
        name = id,
        heading = location.w,
        debugPoly = debugMode,
        minZ = minZ,
        maxZ = maxZ,
    } )

    allPolyZones[id] = {
        id = id,
        zone = boxZone,
        ResourceName = GetInvokingResource()
    }

    boxZone:onPlayerInOut( function(isPointInside, point)
        if isPointInside == true and currentState == false then
            currentState = true
            pcall( function()
                callbackIn()
            end , "Error")
        elseif isPointInside == false and currentState == true then
            currentState = false
            pcall( function()
                callbackOut()
            end , "Error")
        end
    end )

    return boxZone
end
exports('createBoxZone', createBoxZone)


-- ==========| CREATE CIRCLE  |==========--
local function createCircleZone(id, location, distance, callbackIn, callbackOut, debugMode)
    local currentState = false
    local circleZone = CircleZone:Create(vector3(location.x, location.y, location.z), distance, {
        name = id,
        debugPoly = debugMode,
    } )

    allPolyZones[id] = {
        id = id,
        zone = circleZone,
        ResourceName = GetInvokingResource()
    }

    circleZone:onPlayerInOut( function(isPointInside, point)
        if isPointInside == true and currentState == false then
            local myLocation = GetEntityCoords(PlayerPedId())
            local zLocationDifference = myLocation.z - location.z

            if zLocationDifference < 0 then zLocationDifference = zLocationDifference * -1 end

            if zLocationDifference <= distance then
                currentState = true
                pcall( function()
                    callbackIn()
                end , "Error")
            end
        elseif isPointInside == false and currentState == true then
            currentState = false
            pcall( function()
                callbackOut()
            end , "Error")
        end
    end )

    return circleZone
end
exports('createCircleZone', createCircleZone)


-- ==========| CREATE TOP CIRCLE  |==========--
local function createTopCircleZone(id, location, distance, callbackIn, callbackOut, debugMode)
    local currentState = false
    local circleZone = CircleZone:Create(vector3(location.x, location.y, location.z), distance, {
        name = id,
        debugPoly = debugMode,
    } )

    allPolyZones[id] = {
        id = id,
        zone = circleZone,
        ResourceName = GetInvokingResource()
    }

    circleZone:onPlayerInOut( function(isPointInside, point)
        if isPointInside == true and currentState == false then
            currentState = true
            pcall( function()
                callbackIn()
            end , "Error")
        elseif isPointInside == false and currentState == true then
            currentState = false
            pcall( function()
                callbackOut()
            end , "Error")
        end
    end )

    return circleZone
end
exports('createTopCircleZone', createTopCircleZone)


-- ==========| CREATE FLEX  |==========--
local function createFlexZone(id, locations, minZ, maxZ, callbackIn, callbackOut, debugMode)
    local currentState = false
    local flexZone = PolyZone:Create(locations, {
        name = id,
        minZ = minZ,
        maxZ = maxZ,
        debugGrid = debugMode,
        gridDivisions = 25
    } )

    allPolyZones[id] = {
        id = id,
        zone = flexZone,
        ResourceName = GetInvokingResource()
    }

    flexZone:onPlayerInOut( function(isPointInside, point)
        if isPointInside == true and currentState == false then
            currentState = true
            pcall( function()
                callbackIn()
            end , "Error")
        elseif isPointInside == false and currentState == true then
            currentState = false
            pcall( function()
                callbackOut()
            end , "Error")
        end
    end )

    return flexZone
end
exports('createFlexZone', createFlexZone)


-- ==========| DELETE |==========--
local function deletePoly(polyID)
    for i, v in pairs(allPolyZones) do
        if v.id == polyID then
            v.zone:destroy()
        end
    end
end
exports('deletePoly', deletePoly)