<script lang="ts">
  interface Props {
    name: string;
    size?: number;
    class?: string;
    alt?: string;
  }

  let { name, size = 18, class: className = '', alt = '' }: Props = $props();

  let src = $derived(`/icons/${name}.png`);
</script>

<img
  {src}
  alt={alt}
  aria-hidden={alt ? undefined : 'true'}
  class="claude-icon {className}"
  style="width: {size}px; height: {size}px; min-width: {size}px; min-height: {size}px;"
  loading="eager"
  decoding="async"
/>

<style>
  .claude-icon {
    display: inline-block;
    vertical-align: -0.18em;
    object-fit: contain;
    image-rendering: -webkit-optimize-contrast;
    user-select: none;
    pointer-events: none;
    flex-shrink: 0;
  }
</style>
