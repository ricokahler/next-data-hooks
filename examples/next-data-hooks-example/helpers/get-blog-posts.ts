const blogPosts = [
  {
    title: 'Lorem ipsum dolor',
    slug: '1',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urna neque viverra justo nec ultrices. Tellus rutrum tellus pellentesque eu tincidunt. Purus sit amet volutpat consequat mauris. Pretium viverra suspendisse potenti nullam ac tortor. Ultrices eros in cursus turpis massa tincidunt dui. Enim tortor at auctor urna nunc id cursus. Neque sodales ut etiam sit amet nisl. Purus gravida quis blandit turpis cursus in hac habitasse platea. Amet est placerat in egestas erat imperdiet sed euismod nisi. Fames ac turpis egestas sed. Libero justo laoreet sit amet cursus. Platea dictumst vestibulum rhoncus est. Elit at imperdiet dui accumsan sit. Quam vulputate dignissim suspendisse in est ante in nibh mauris. Viverra aliquet eget sit amet tellus. Leo a diam sollicitudin tempor id eu nisl nunc. Tellus at urna condimentum mattis pellentesque id nibh.',
  },
  {
    title: 'Dignissim convallis aenean',
    slug: '2',
    content:
      'Dignissim convallis aenean et tortor at risus viverra. Nibh cras pulvinar mattis nunc sed. Varius morbi enim nunc faucibus a pellentesque sit amet. Porta non pulvinar neque laoreet. Pretium viverra suspendisse potenti nullam ac. Metus dictum at tempor commodo ullamcorper a lacus vestibulum sed. Morbi tincidunt ornare massa eget egestas purus. A diam sollicitudin tempor id eu nisl nunc mi. Sit amet commodo nulla facilisi. Vitae sapien pellentesque habitant morbi tristique senectus et netus. Morbi enim nunc faucibus a pellentesque sit.',
  },
  {
    title: 'Semper viverra nam',
    slug: '3',
    content:
      'Semper viverra nam libero justo. Blandit libero volutpat sed cras ornare. Neque convallis a cras semper auctor. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Vel risus commodo viverra maecenas accumsan lacus vel facilisis. Nulla posuere sollicitudin aliquam ultrices sagittis orci a. Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Praesent semper feugiat nibh sed pulvinar. Ac orci phasellus egestas tellus rutrum. Ut ornare lectus sit amet est placerat in egestas erat. Ut tortor pretium viverra suspendisse potenti nullam ac tortor vitae. Nam at lectus urna duis convallis convallis tellus id interdum. Neque sodales ut etiam sit amet nisl purus in.',
  },
  {
    title: 'Semper feugiat nibh',
    slug: '4',
    content:
      'Semper feugiat nibh sed pulvinar proin gravida hendrerit. Amet tellus cras adipiscing enim eu turpis egestas pretium aenean. Commodo quis imperdiet massa tincidunt nunc pulvinar sapien. Eu non diam phasellus vestibulum lorem sed risus ultricies. Morbi tincidunt augue interdum velit euismod in pellentesque massa. Amet aliquam id diam maecenas ultricies mi. Amet luctus venenatis lectus magna fringilla urna. Ipsum dolor sit amet consectetur adipiscing elit duis. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt. Eget nunc lobortis mattis aliquam.',
  },
  {
    title: 'Quis imperdiet massa',
    slug: '5',
    content:
      'Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula. Ut porttitor leo a diam. Adipiscing enim eu turpis egestas. At urna condimentum mattis pellentesque. Vitae elementum curabitur vitae nunc sed velit dignissim sodales ut. Fames ac turpis egestas integer. Aliquet bibendum enim facilisis gravida neque. Pellentesque eu tincidunt tortor aliquam nulla facilisi. Quisque sagittis purus sit amet volutpat consequat mauris nunc. Ac turpis egestas sed tempus urna et pharetra.',
  },
];

/**
 * A simple mock helper that demonstrates returning data from an async source.
 * This could be your real API.
 */
async function getBlogPosts() {
  // This side-effect is used in the e2e test and is used to determine if this
  // file was excluded from the bundle. Since it's a side-effect, it won't be
  // shaken from the build by default
  console.log('get-blog-posts-side-effect');

  await new Promise((resolve) => setTimeout(resolve, 0));
  return blogPosts;
}

export default getBlogPosts;
