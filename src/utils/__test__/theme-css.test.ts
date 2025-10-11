import { describe, expect, it } from 'vitest'
import { buildPerThemeVariantCss } from '../theme-css'

describe('buildPerThemeVariantCss', () => {
  it('generates CSS with default display block', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.profile-image',
      variantAttr: 'data-theme',
    })
    expect(result).toContain('display:block')
    expect(result).toContain('.profile-image{display:none}')
  })

  it('generates CSS with custom display value', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.icon',
      variantAttr: 'data-variant',
      display: 'inline-block',
    })
    expect(result).toContain('display:inline-block')
  })

  it('generates rules for light theme', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    expect(result).toContain('[data-theme="light"]')
  })

  it('generates rules for dark theme', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    expect(result).toContain('[data-theme="dark"]')
  })

  it('generates rules for non-base themes', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    // Should include cyberpunk, halloween, christmas, etc.
    expect(result).toContain('[data-theme="cyberpunk"]')
  })

  it('includes html class prefix', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    expect(result).toContain('html.')
  })

  it('hides all variants by default', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    expect(result).toMatch(/^\.test\{display:none\}/)
  })

  it('uses :not() selectors to prevent conflicts', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    expect(result).toContain(':not(')
  })

  it('handles different base selectors', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '#unique-id',
      variantAttr: 'data-theme',
    })
    expect(result).toContain('#unique-id{display:none}')
    expect(result).toContain('#unique-id[data-theme=')
  })

  it('handles different variant attributes', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.image',
      variantAttr: 'data-variant-type',
    })
    expect(result).toContain('[data-variant-type="light"]')
    expect(result).toContain('[data-variant-type="dark"]')
  })

  it('generates valid CSS syntax', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.test',
      variantAttr: 'data-theme',
    })
    // Should not have spaces between selectors and braces
    expect(result).not.toContain(' {')
    // Should have proper attribute selector format
    expect(result).toMatch(/\[data-theme="[^"]+"\]/)
  })

  it('supports inline display', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.span-element',
      variantAttr: 'data-theme',
      display: 'inline',
    })
    expect(result).toContain('display:inline')
  })

  it('supports none display (though redundant)', () => {
    const result = buildPerThemeVariantCss({
      baseSelector: '.hidden',
      variantAttr: 'data-theme',
      display: 'none',
    })
    expect(result).toContain('display:none')
  })
})
