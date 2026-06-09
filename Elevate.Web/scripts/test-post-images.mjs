import assert from 'node:assert/strict';

import {
  getImageLoadingProps,
  getThumbnailImageProps,
  POST_CARD_IMAGE_SIZES,
} from '../src/utils/postImages.js';

{
  assert.equal(getThumbnailImageProps(null), null);
  assert.equal(getThumbnailImageProps({}), null);
}

{
  const props = getThumbnailImageProps('https://example.com/original.jpg');

  assert.deepEqual(props, {
    src: 'https://example.com/original.jpg',
    srcSet: undefined,
    sizes: POST_CARD_IMAGE_SIZES,
    width: undefined,
    height: undefined,
  });
}

{
  const props = getThumbnailImageProps({
    url: 'https://example.com/original.jpg',
    signedUrl: 'https://signed.example.com/original.jpg',
    width: 1600,
    height: 900,
  });

  assert.equal(props.src, 'https://signed.example.com/original.jpg');
  assert.equal(props.width, 1600);
  assert.equal(props.height, 900);
}

{
  const props = getThumbnailImageProps({
    url: 'https://account.blob.core.windows.net/images/uploads/legacy-original.jpg',
    signedUrl: 'https://account.blob.core.windows.net/images/uploads/legacy-original.jpg?sig=abc',
    width: 3200,
    height: 1800,
  });

  assert.equal(props, null);
}

{
  const props = getThumbnailImageProps({
    signedUrl: 'https://signed.example.com/original.jpg',
    width: 1600,
    height: 900,
    variants: {
      hero: {
        signedUrl: 'https://signed.example.com/hero.webp',
        width: 1440,
        height: 810,
      },
      thumb: {
        url: 'https://example.com/thumb.webp',
        width: 480,
        height: 270,
      },
      card: {
        url: 'https://example.com/card.webp',
        width: 960,
        height: 540,
      },
      invalid: {
        signedUrl: '',
        width: 320,
      },
    },
  });

  assert.equal(props.src, 'https://example.com/card.webp');
  assert.equal(props.srcSet, 'https://example.com/thumb.webp 480w, https://example.com/card.webp 960w');
  assert.equal(props.width, 960);
  assert.equal(props.height, 540);
}

{
  const props = getThumbnailImageProps({
    signedUrl: 'https://signed.example.com/original.jpg',
    variants: {
      hero: {
        signedUrl: 'https://signed.example.com/hero.webp',
        width: 1440,
        height: 810,
      },
      thumb: {
        signedUrl: 'https://signed.example.com/thumb.webp',
        width: 480,
        height: 270,
      },
    },
  });

  assert.equal(props.src, 'https://signed.example.com/thumb.webp');
  assert.equal(props.width, 480);
  assert.equal(props.height, 270);
  assert.equal(props.srcSet, 'https://signed.example.com/thumb.webp 480w');
}

{
  const props = getThumbnailImageProps({
    signedUrl: 'https://signed.example.com/original.jpg',
    variants: {
      hero: {
        signedUrl: 'https://signed.example.com/hero.webp',
        width: 1440,
        height: 810,
      },
      card: {
        signedUrl: 'https://signed.example.com/card.webp',
        width: 960,
        height: 540,
      },
    },
  }, { maxVariantWidth: 960 });

  assert.equal(props.src, 'https://signed.example.com/card.webp');
  assert.equal(props.width, 960);
  assert.equal(props.height, 540);
  assert.equal(props.srcSet, 'https://signed.example.com/card.webp 960w');
}

{
  assert.deepEqual(getImageLoadingProps(true), {
    loading: 'eager',
    decoding: 'async',
    fetchPriority: 'high',
  });
  assert.deepEqual(getImageLoadingProps(false), {
    loading: 'lazy',
    decoding: 'async',
    fetchPriority: 'auto',
  });
}
