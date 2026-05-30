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
      invalid: {
        signedUrl: '',
        width: 320,
      },
    },
  });

  assert.equal(props.src, 'https://signed.example.com/hero.webp');
  assert.equal(props.srcSet, 'https://example.com/thumb.webp 480w, https://signed.example.com/hero.webp 1440w');
  assert.equal(props.width, 1440);
  assert.equal(props.height, 810);
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
