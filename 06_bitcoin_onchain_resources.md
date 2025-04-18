# Bitcoin On-Chain Resources

This document provides a comprehensive list of all Bitcoin-inscribed resources used in Bitcoin Protozoa. These on-chain resources ensure our application is truly eternal, leveraging Bitcoin's immutability to guarantee perpetual availability without reliance on any external servers, CDNs, or package repositories.

## Core Principles

1. **Bitcoin Permanence**: Bitcoin provides a permanent, immutable foundation for deployed applications
2. **Resource Eternity**: Inscribed libraries and resources are forever available on-chain
3. **No Fallbacks Required**: Since Bitcoin resources are eternal, there's no need for CDN or local fallbacks
4. **Lean Implementation**: Focus on minimizing our application footprint while maximizing functionality
5. **Bitcoin-Native Development**: Develop with the specific constraints and advantages of Bitcoin in mind

## On-Chain Resource Access

All resources are accessed directly from Bitcoin inscriptions via their inscription IDs. The application includes a specialized loader to fetch these resources in the correct order.

### Resource Access URLs

- **Development Environment**: `https://ordinals.com/content/InscriptionID`
- **Production Environment**: `/content/InscriptionID`

### Bitcoin Block Data Access

- **Development Environment**: `https://ordinals.com/r/blockinfo/${blockNumber}`
- **Production Environment**: `/r/blockinfo/${blockNumber}`

## React Framework Resources

| Resource | Version | Inscription ID | Purpose |
|----------|---------|----------------|---------|
| React | 18.2.0 | 7f403153b6484f7d24f50a51e1cdf8187219a3baf103ef0df5ea2437fb9de874i0 | Core UI framework |
| ReactDOM | 18.2.0 | 89295aaf617708128b95d22e7099ce32108d4b918386e6f90994e7979d22ba72i0 | DOM manipulation for React |
| Scheduler | 0.23.0 | 9b09a0f234355106e9311a21fbe5324c90f7317f04c00bc73e1114c9af745743i0 | Required React dependency |
| React Reconciler | 0.27.0 | 9b0338c4e84987a374845235a3b4f0fe73b205b336a7b936e05c71deb5a1882ci0 | React reconciliation engine |

## 3D Rendering Resources

| Resource | Version | Inscription ID | Purpose |
|----------|---------|----------------|---------|
| Three.js | 0.163.0 | 2dbdf9ebbec6be793fd16ae9b797c7cf968ab2427166aaf390b90b71778266abi0 | Core 3D rendering engine |
| React Three Fiber | 8.13.7 | 24c424c795d50c3f1d344253d163e7eaa34e904aef038b6031d706e76676c634i0 | React bindings for Three.js |
| React Three Drei | 9.80.7 | 9f77a1efc4c880197ba8d197d5e87539443ed5ebcf027b1fee25db8bd1cf4605i0 | Useful helpers for React Three Fiber |
| GLTFLoader | latest | 614855c7c7541594c846a96a81db7bcedaff2831711e3b89670aba4c2fefb404i0 | For loading 3D models |
| TextGeometry | latest | 77ef4bc8b15f0a764903f3bb2ccd0566ac6c111bd3d884bc814cfde49565dbc9i0 | For 3D text rendering |
| FontLoader | latest | fcacfdd75ef21965ec98d9a1a107e8f5468f23ff15131cae44fc6aca86538147i0 | For loading fonts in Three.js |
| BufferGeometryUtils | latest | 71616486e00954e0087b6bfd6b110fe0a32d1b174b94b634b34f27dd04f70a5ci0 | Buffer geometry utilities |

## Animation & Effects Resources

| Resource | Version | Inscription ID | Purpose |
|----------|---------|----------------|---------|
| GSAP | 3.6.1 | 6577ec768235a2a911e91a115b964618581bde91d99bc58f5c7390fdfb155ae6i0 | Animation library |
| React-spring-core | 9.7.3 | 09fe4a18d81abc481597bdd9ddfa65aadb95defc18de3ec925ec0b45ac3c7c49i0 | Physics-based animations |
| Shader-composer | 0.4.3 | 1c9c11c3b82bce54bfa989a44a1057f8c39d3b8b9dc2e13ec1f99e4a0f3a0f77i0 | WebGL shader composition |
| vfx-composer | 0.4.0 | 9f59e26bc81e4d741f77320eaf9e9df8cce623c9639f9c1a49497ac75607e9bei0 | Visual effects composition |
| Chroma | latest | c49f28a5c9e67efb85d44b9ee12efa2839b0251bad14efc5e6c32406505e259ci0 | Color manipulation |

## Utility Libraries

| Resource | Version | Inscription ID | Purpose |
|----------|---------|----------------|---------|
| Crypto-js | 4.1.1 | 66979aec90e592bc5be7fddcef23daeff982662b7225e7804c1b271f1b0d267ai0 | Cryptography functions |
| Pako | 2.1.0 | fba6f95fb1152db43304a27dce8cb8c65509eba6ab0b6958cedeb33e5f443077i0 | Compression library |
| JSZip | 3.10.1 | 372c5388030820daed356d25d7a1218d0b88d78a6d051d27c91d0f25ac4c3c5ei0 | File compression/decompression |
| fflate | 0.8.0 | 657973995aa2a47c3fe02debb22405dadf6b49148d97027627bced89a73f408fi0 | Fast compression library |
| Buffer | latest | fb15f2a6ed1d3031aa214cc12d3fa696508080c0baa194463920c8a79d21aa54i0 | Binary data handling |
| brotli/decode.min.js | latest | b1d16a7a1ada08b5c7f51837478f578c0abd0973809c439228f28ccd5c38e44ai0 | Decompression utility |
| Moment.js | 2.29.1 | b90b4516ea1a0b882e67387eb4f3e5def0307704b046e8ef98c5e72092c47eedi0 | Date/time library |
| Axios | latest | 6b81993428a217a341ffd68f3b3aa3664b2cfc674d57aad0d3b6daa0f125b821i0 | HTTP client |
| Highlight.js | 11.7.0 | 41d856597a8474e7124a0641b54afb77bc034f800e1be8fe02a20b55023ff4a7i0 | Syntax highlighting |
| GRC-img | v1 | e5ef65604e1ad9c90fb3c74918e00a960ce2e814fba412556afec6b3a4e25257i0 | Image processing |
| Open Ordinal Stitch | 0.9.0 | a196634768a6a715779fa8d513b65b8d2099defc2bd09c36dccbf54ffdd04022i0 | Ordinals utility |

## CSS & UI Resources

| Resource | Version | Inscription ID | Purpose |
|----------|---------|----------------|---------|
| Tailwind | latest | 0703423f633ed5cef7e3b45bfd8df43ab0d6783850d51005b105f01dd60d25c3i0 | CSS framework |
| Bitcoin Icons | 1.0 | 01a4ff05b7591d14afa8a70aa80fd17b49e972f34a65bf69c6fc5ea09f08ab04i0 | Bitcoin-specific icons |
| Lucide Icons | 0.363.0 | 5546e0dea8b7fc991ef3ae22802ee7e793f814049ae9f32409ced33739840137i0 | General UI icons |

## Fonts

| Resource | Version | Inscription ID | Purpose |
|----------|---------|----------------|---------|
| Inter Font | latest | 7b47a3cb9fc6ac82af2c1a33bfa4d296bcb83e9219a6434d889f8b95e5b917a6i0 | Primary UI font |
| Roboto Mono | latest | 6dfd10683c0388525b48a8b0a922fada7c0472e8a6c0fb6167add56c9acc1c87i0 | Monospace font |
| IBM Plex Sans | latest | d0ab3f7fdbc7cfe83f3bad13c5754f2f48357a0b2af3f72443d3875bea78a680i0 | Secondary UI font |

## Implementation Details

### Resource Loading

All Bitcoin on-chain resources are loaded through our specialized `InscriptionLoaderService`, which handles dependency resolution, loading order, caching, and verification. This service ensures that all resources are loaded directly from Bitcoin inscriptions, with no fallbacks to external sources.

```javascript
// Example of loading process in HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitcoin Protozoa - Eternal Edition</title>
</head>
<body>
  <div id="root"></div>

  <!-- Bootstrap loader for on-chain resources -->
  <script>
    // Minimal loader to bootstrap the inscription loader
    (function() {
      const bootLoader = document.createElement('script');
      bootLoader.src = '/content/[Loader Inscription ID]';
      bootLoader.onload = () => console.log('Bitcoin Protozoa resource loader initialized');
      bootLoader.onerror = () => console.error('Failed to load Bitcoin Protozoa resource loader');
      document.head.appendChild(bootLoader);
    })();
  </script>
</body>
</html>
```

### Bitcoin Block Data Access

The application accesses Bitcoin block data through the ordinals.com API during development and through the Bitcoin ordinals native endpoint in production. This data is used for:

1. **RNG Seeding**: The block nonce is used as a seed for the Mulberry32 RNG algorithm
2. **Evolution Mechanics**: The confirmation count is used to trigger evolution events at specific milestones

```javascript
// Example of Bitcoin block data access
async function fetchBlockData(blockNumber) {
  const endpoint = process.env.NODE_ENV === 'production'
    ? `/r/blockinfo/${blockNumber}`
    : `https://ordinals.com/r/blockinfo/${blockNumber}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  // Extract only the nonce and confirmations fields
  return {
    nonce: data.nonce,
    confirmations: data.confirmations
  };
}
```

## Conclusion

By exclusively using Bitcoin-inscribed resources, Bitcoin Protozoa achieves true eternality. All dependencies and assets are permanently stored on the Bitcoin blockchain, ensuring the application will continue to function as long as Bitcoin exists, without reliance on centralized infrastructure.
