-- obsidian.lua — converte il Markdown di Obsidian usato in ../Appunti nel LaTeX
-- atteso da main.tex/preamble.tex:
--   * callout "> [!tipo] Titolo"            -> ambienti tcolorbox (boxdefinition, ...)
--   * "![alt|px](assets/x.png)" + "*Fig. N — didascalia*" -> figure con \caption
--     (float [htbp] nel testo, non flottanti dentro i callout)
--   * [[NN - Titolo]]                        -> \hyperref al capitolo NN
--   * blocchi di codice                      -> Verbatim (fvextra, righe spezzate)
--   * "---" tra le sezioni                   -> rimossi
--   * riga "Appunti di Fabio Piscitelli — …" -> rimossa (è nel frontespizio)

local CALLOUTS = {
  definition = 'boxdefinition', theorem = 'boxtheorem', example = 'boxexample',
  note = 'boxnote', info = 'boxnote', quote = 'boxnote', cite = 'boxnote',
  tip = 'boxtip', hint = 'boxtip', important = 'boxtip', success = 'boxtip',
  warning = 'boxwarning', caution = 'boxwarning', attention = 'boxwarning',
  danger = 'boxwarning', failure = 'boxwarning', bug = 'boxwarning',
  abstract = 'boxabstract', summary = 'boxabstract', tldr = 'boxabstract',
  question = 'boxquestion', faq = 'boxquestion', help = 'boxquestion',
}

-- larghezza (px) a cui si riferisce "|px" nell'alt delle immagini:
-- circa la larghezza della colonna di lettura di Obsidian
local TEXTWIDTH_PX = 700

local input = PANDOC_STATE.input_files[1] or ''
local CHAP = input:match('([0-9][0-9])[^/]*$') or '00'

local function latex(inlines)
  local out = pandoc.write(pandoc.Pandoc({ pandoc.Plain(inlines) }), 'latex')
  return (out:gsub('[ \t\r\n]+$', ''))
end

local function trim(inlines)
  while #inlines > 0 and (inlines[1].t == 'Space' or inlines[1].t == 'SoftBreak') do
    table.remove(inlines, 1)
  end
  while #inlines > 0 and (inlines[#inlines].t == 'Space' or inlines[#inlines].t == 'SoftBreak') do
    table.remove(inlines)
  end
  return inlines
end

-- [[NN - Titolo]] diventa un link al capitolo se è un file di ../Appunti
local function is_chapter(target)
  local f = io.open('../Appunti/' .. target .. '.md', 'r')
  if f then f:close(); return true end
  return false
end

function Link(l)
  if l.title == 'wikilink' then
    local num = l.target:match('^([0-9][0-9])')
    if num and is_chapter(l.target) then
      return pandoc.RawInline('latex', '\\hyperref[ch-' .. num .. ']{\\emph{' .. latex(l.content) .. '}}')
    end
    return pandoc.Emph(l.content)
  end
end

function Header(h)
  if h.level == 1 then h.identifier = 'ch-' .. CHAP end
  return h
end

function HorizontalRule()
  return {}
end

function CodeBlock(cb)
  return pandoc.RawBlock('latex', '\\begin{Verbatim}\n' .. cb.text .. '\n\\end{Verbatim}')
end

-- costruisce il LaTeX di un'immagine con didascalia; floating = figura [htbp]
local function figure(p, floating)
  local c = p.content
  local img = c[1]
  local caption = {}
  for k = 2, #c do
    if c[k].t == 'Emph' then caption = c[k].content; break end
  end
  -- toglie il prefisso "Fig. 1.2 —": la numerazione la fa LaTeX
  local numbered = #caption > 0 and caption[1].t == 'Str' and caption[1].text:match('^Fig') ~= nil
  if numbered then
    local k = 1
    while k <= #caption and not (caption[k].t == 'Str' and caption[k].text == '—') do k = k + 1 end
    if k <= #caption then
      local rest = {}
      for j = k + 1, #caption do rest[#rest + 1] = caption[j] end
      caption = trim(rest)
    end
  end
  local alt = pandoc.utils.stringify(img.caption)
  local px = alt:match('|%s*(%d+)%s*$')
  local frac = px and math.min(tonumber(px) / TEXTWIDTH_PX, 1.0) or 0.8
  local src = img.src:gsub('^assets/', 'images/')
  local gfx = string.format(
    '\\includegraphics[width=%.2f\\linewidth,height=0.42\\textheight,keepaspectratio]{%s}', frac, src)
  local cap = latex(caption)
  if floating then
    return pandoc.RawBlock('latex', string.format(
      '\\begin{figure}[htbp]\n\\centering\n%s\n\\caption%s{%s}\n\\end{figure}',
      gfx, numbered and '' or '*', cap))
  end
  local capcmd = ''
  if #caption > 0 then
    capcmd = string.format('\\captionof%s{figure}{%s}\n', numbered and '' or '*', cap)
  end
  return pandoc.RawBlock('latex', string.format(
    '\\begin{center}\n%s\n%s\\end{center}', gfx, capcmd))
end

local function is_figure(b)
  return b.t == 'Para' and #b.content > 0 and b.content[1].t == 'Image'
end

local function is_byline(b)
  return (b.t == 'Para' or b.t == 'Plain')
    and pandoc.utils.stringify(b):match('^Appunti di Fabio Piscitelli') ~= nil
end

-- converte ricorsivamente i blocchi (dentro i callout: niente float)
local convert_blocks

local function callout(bq)
  local first = bq.content[1]
  if not first or (first.t ~= 'Para' and first.t ~= 'Plain') then return nil end
  local marker = first.content[1]
  if not marker or marker.t ~= 'Str' then return nil end
  local kind = marker.text:match('^%[!([%w-]+)%][+-]?$')
  if not kind then return nil end
  local env = CALLOUTS[kind:lower()] or 'boxnote'

  -- titolo = resto della prima riga; ciò che segue va nel corpo
  local title, rest, i = {}, {}, 2
  local inl = first.content
  while i <= #inl and inl[i].t ~= 'SoftBreak' and inl[i].t ~= 'LineBreak' do
    title[#title + 1] = inl[i]; i = i + 1
  end
  for j = i + 1, #inl do rest[#rest + 1] = inl[j] end

  local body = {}
  if #rest > 0 then body[#body + 1] = pandoc.Para(rest) end
  for j = 2, #bq.content do body[#body + 1] = bq.content[j] end

  local blocks = { pandoc.RawBlock('latex', '\\begin{' .. env .. '}{' .. latex(trim(title)) .. '}') }
  for _, b in ipairs(convert_blocks(body, false)) do blocks[#blocks + 1] = b end
  blocks[#blocks + 1] = pandoc.RawBlock('latex', '\\end{' .. env .. '}')
  return blocks
end

convert_blocks = function(blocks, floating)
  local out = {}
  for _, b in ipairs(blocks) do
    if is_byline(b) then
      -- rimosso
    elseif b.t == 'HorizontalRule' then
      -- rimosso
    elseif is_figure(b) then
      out[#out + 1] = figure(b, floating)
    elseif b.t == 'BlockQuote' then
      local r = callout(b)
      if r then
        for _, x in ipairs(r) do out[#out + 1] = x end
      else
        b.content = convert_blocks(b.content, false)
        out[#out + 1] = b
      end
    else
      out[#out + 1] = b
    end
  end
  return out
end

function Pandoc(doc)
  -- prima i filtri inline (Link, Header, CodeBlock) sono già stati applicati da pandoc;
  -- qui si convertono figure e callout con la gestione dei float
  doc.blocks = convert_blocks(doc.blocks, true)
  return doc
end
