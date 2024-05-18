-- ==========| OX MENU |==========--
local function ox_menu(id, title, position, options, scrollCallback, selectedCallback, onCheckCallback, menuCloseCallback,
                       submitCallback)
    lib.registerMenu({
        id = id,
        title = title,
        position = position,
        onSideScroll = function(selected, scrollIndex, args)
            scrollCallback(selected, scrollIndex, args)
        end,
        onSelected = function(selected, secondary, args)
            selectedCallback(selected, secondary, args)
        end,
        onCheck = function(selected, checked, args)
            onCheckCallback(selected, checked, args)
        end,
        onClose = function(keyPressed)
            menuCloseCallback(keyPressed)
        end,
        options = options
    }, function()
        submitCallback(selected, scrollIndex, args)
    end)
    lib.showMenu(id)
end
exports('ox_menu', ox_menu)


-- ==========| OX MENU HIDE |==========--
local function ox_menu_hide()
    lib.hideMenu(true)
end
exports('ox_menu_hide', ox_menu_hide)


-- ==========| OX CONTEXT |==========--
local function ox_context(id, title, options, onClose)
    lib.registerContext({
        id = id,
        title = title,
        onBack = function()
            onClose()
        end,
        onExit = function()
            onClose()
        end,
        options = options
    })
    lib.showContext(id)
end
exports('ox_context', ox_context)


-- ==========| OX MESSAGE |==========--
local function ox_message(title, description, type)
    lib.notify({
        title = title,
        description = description,
        type = type
    })
end
exports('ox_message', ox_message)


-- ==========| OX PROGRESS |==========--
local function ox_progerss(label, duration, onComplete, onCancel)
    if lib.progressCircle({
            label = label,
            duration = duration * 1000,
            position = 'bottom',
            useWhileDead = false,
            canCancel = true,
            disable =
            {
                move = true,
                car = true,
                combat = true,
                sprint = true
            },
            anim = {},
            prop = {},
        }) then
        onComplete()
    else
        onCancel()
    end
end
exports('ox_progerss', ox_progerss)


-- ==========| OX PROGRESS |==========--
local function ox_progerss_move(label, duration, onComplete, onCancel)
    if lib.progressCircle({
            label = label,
            duration = duration * 1000,
            position = 'bottom',
            useWhileDead = false,
            canCancel = true,
            disable =
            {
                sprint = true
            },
            anim = {},
            prop = {},
        }) then
        onComplete()
    else
        onCancel()
    end
end
exports('ox_progerss_move', ox_progerss_move)


-- ==========| OX INPUT |==========--
local function ox_input(message, options, onComplete)
    local input = lib.inputDialog(message, { options })
    onComplete(input)
end
exports('ox_input', ox_input)


-- ==========| OX INPUT ADVANCED |==========--
local function ox_input_advanced(message, options, onComplete)
    local input = lib.inputDialog(message, options)
    onComplete(input)
end
exports('ox_input_advanced', ox_input_advanced)


-- ==========| OX INPUT CLOSE |==========--
local function ox_input_close()
    lib.closeInputDialog()
end
exports('ox_input_close', ox_input_close)


-- ==========| OX TEXT UI |==========--
local function ox_text_ui(message, position, backgroundColor, textColor)
    lib.showTextUI(message, {
        position = position,
        icon = '',
        style =
        {
            borderRadius = 0,
            backgroundColor = backgroundColor,
            color = textColor
        }
    })
end
exports('ox_text_ui', ox_text_ui)


-- ==========| OX TEXT UI |==========--
local function ox_text_ui_hide()
    lib.hideTextUI()
end
exports('ox_text_ui_hide', ox_text_ui_hide)


-- ==========| OX RADIAL REGISTER |==========--
local function ox_register_radial(id, options)
    lib.registerRadial({
        id = id,
        items = options
    })
end
exports('ox_register_radial', ox_register_radial)


-- ==========| OX RADIAL REGISTER |==========--
local function ox_add_radial(options)
    lib.addRadialItem(options)
end
exports('ox_add_radial', ox_add_radial)


-- ==========| OX RADIAL REMOVE |==========--
local function ox_remove_radial(id)
    lib.removeRadialItem(id)
end
exports('ox_remove_radial', ox_remove_radial)


-- ==========| OX RADIAL REMOVE |==========--
local function ox_clear_radial()
    lib.clearRadialItems()
end
exports('ox_clear_radial', ox_clear_radial)
