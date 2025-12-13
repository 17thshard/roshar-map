<template>
  <div :class="['details', { 'details--image': details.image !== undefined }]">
    <router-link
      :class="['details__close', { 'details__close--opaque': reachedHeading }]"
      :title="$t('ui.close')"
      :to="`/${$route.params.locale}`"
    >
      <XIcon />
    </router-link>
    <Scrollbar
      ref="scroller"
      class="details__scroller"
      :ops="$store.state.scrollbarOptions"
    >
      <div class="details__content">
        <figure v-if="details.image !== undefined" class="details__image">
          <div
            class="details__image-art"
            :style="{
              backgroundImage: imageSrcSet.css,
              paddingBottom: `${(imageAspect * 100).toFixed(3)}%`,
              backgroundSize: `${width}px auto`
            }"
          />
          <Markdown :content="imageCredits" tag="figcaption" inline />
        </figure>
        <section class="details__text">
          <div ref="intersectionGuard" class="details__intersection-guard" />
          <h2 ref="title" class="details__title">
            {{ $t(`${baseTranslationKey}.name`) }}
          </h2>
          <ul v-if="Object.keys(metadata).length > 0" class="details__metadata">
            <li v-if="metadata.date">
              <CalendarIcon :aria-label="$t(`ui.date`)" class="details__metadata-icon" size="1.25x" />
              {{ metadata.date }}
              <button class="details__date-help" :title="$t('ui.date-help')" @click="$store.commit('openCalendarGuide')">
                <HelpCircleIcon size="1.25x" />
              </button>
            </li>
            <li v-if="metadata.chapter">
              <BookIcon :aria-label="$t(`ui.chapter`)" class="details__metadata-icon" size="1.25x" />
              <Markdown tag="span" :content="metadata.chapter" inline />
            </li>
          </ul>
          <Markdown :content="text" tag="article" />
          <a
            v-if="details.coppermind !== undefined"
            :href="`https://coppermind.net/wiki/${details.coppermind}`"
            target="_blank"
            class="details__read-more"
          >
            {{ $t('ui.coppermind') }}
          </a>
        </section>
        <section v-if="anyRelated" class="details__related">
          <h3>{{ $t('ui.related') }}</h3>
          <div
            v-for="type in ['events', 'locations', 'characters', 'misc'].filter(t => related[t] !== undefined && related[t].length > 0)"
            :key="type"
            class="details__related-group"
          >
            <h4 class="details__related-group-title">
              {{ $t(`entry-types.${type}`) }}
            </h4>
            <router-link
              v-for="link in related[type]"
              :key="link.translationKey"
              :to="{ name: type, params: { locale: $route.params.locale, id: link.id } }"
              class="details__related-link"
            >
              <div class="details__related-link-icon">
                <div
                  v-if="link.image !== undefined"
                  :style="link.image"
                  :title="$t(link.translationKey)"
                  class="details__related-link-image"
                />
                <svg v-else class="details__related-link-placeholder" width="100%" height="100%" viewBox="0 0 1 1">
                  <path
                    fill="#f6f8fa"
                    d="m0.50012 0 1e-5 4.4563e-4c-1e-3 0.00154-2e-3 0.0032049-5e-3 0.0035039-4e-3 5.3026e-4 -8e-3 1.5649e-4 -0.01-5.9198e-4 -1e-3 0.0041748-2e-3 0.0057229-4e-3 0.0078486h0.0187v-1.2505e-4 1.2505e-4h0.0187c-1e-3 -0.0021256-3e-3 -0.0036737-4e-3 -0.0078486-2e-3 7.4847e-4 -6e-3 0.0011222-0.01 5.9198e-4 -2e-3 -2.99e-4 -3e-3 -0.0019639-5e-3 -0.0035039l1e-5 -4.4563e-4c8.8e-4 7.403e-5 8.2e-4 1.5224e-4 7.6e-4 2.2747e-4 -6e-5 -7.502e-5 -1.2e-4 -1.536e-4 -1.8e-4 -2.2747e-4zm-0.0135 0.01772c5e-3 0.0038173 8e-3 0.008278 5e-3 0.015274h0.0164c-3e-3 -0.006996 6.8e-4 -0.011456 5e-3 -0.015274h-0.0136zm-7.5e-4 0.022268c2.9e-4 0.003573-1e-3 0.0041819-2e-3 0.0054859 6e-3 0.0015919 9e-3 0.0038014 9e-3 0.0097574-5e-3 0.0032526-5e-3 0.0094535-8e-5 0.013242-5e-3 0.0032526-5e-3 0.0094544-7e-5 0.013165-5e-3 0.003176-5e-3 0.0093762-7e-5 0.013164-5e-3 0.0032526-5e-3 0.0094535-9e-5 0.013242-5e-3 0.003253-5e-3 0.009454-8e-5 0.013242-5e-3 0.003253-5e-3 0.009454-9e-5 0.013242-5e-3 0.003253-5e-3 0.009454-8e-5 0.013242-5e-3 0.003253-5e-3 0.009454-8e-5 0.013242-5e-3 0.003253-5e-3 0.009454-9e-5 0.013242-5e-3 0.003253-5e-3 0.009454-8e-5 0.013242-5e-3 0.003253-5e-3 0.009388-8e-5 0.013176-3e-3 0.002711-3e-3 0.003932-3e-3 0.006811l0.0112 5.46e-5 0.0111-5.46e-5c-8e-5 -0.002879-3.1e-4 -0.0041-3e-3 -0.006811 5e-3 -0.003788 5e-3 -0.009924-7e-5 -0.013176 5e-3 -0.003788 5e-3 -0.009989-9e-5 -0.013242 5e-3 -0.003788 5e-3 -0.009989-8e-5 -0.013242 5e-3 -0.003788 5e-3 -0.009989-8e-5 -0.013242 5e-3 -0.003788 5e-3 -0.009989-9e-5 -0.013242 5e-3 -0.003788 5e-3 -0.009989-8e-5 -0.013242 5e-3 -0.003788 5e-3 -0.009989-9e-5 -0.013242 5e-3 -0.003788 5e-3 -0.0099886-8e-5 -0.013242 5e-3 -0.0037879 5e-3 -0.0099886-7e-5 -0.013164 5e-3 -0.0037112 5e-3 -0.0099131-7e-5 -0.013165 5e-3 -0.0037879 5e-3 -0.0099886-9e-5 -0.013242 4.6e-4 -0.0059559 3e-3 -0.0081655 9e-3 -0.0097574-1e-3 -0.0013041-2e-3 -0.001913-2e-3 -0.0054859h-0.0144zm-8e-3 0.10023c-0.0769 0.004793-0.15001 0.034748-0.20785 0.085142l0.0113 0.011803c0.0548-0.047484 0.12385-0.075809 0.19652-0.080562zm0.0443 0v0.016384c0.0727 0.004752 0.14176 0.033077 0.19652 0.080562l0.0113-0.011803c-0.0578-0.050393-0.13097-0.080349-0.20786-0.085142zm-0.32804 0.033779c-4.5e-4 -9.1e-7 -8.7e-4 1.4475e-4 -1e-3 3.9243e-4 -2.4e-4 3.3884e-4 -3.9e-4 7.577e-4 -3.9e-4 0.001212l3e-5 0.017813c0 0.001132 9.2e-4 0.002041 2e-3 0.002039l0.0178-3.06e-5c4.3e-4 -6.7e-7 8.2e-4 -1.3233e-4 1e-3 -3.5517e-4 2.2e-4 -3.2628e-4 3.6e-4 -7.2105e-4 3.6e-4 -0.001148l6e-5 -0.017813c0-0.001132-9.1e-4 -0.002046-2e-3 -0.00205zm0.61178 0-0.0178 5.98e-5c-1e-3 3e-6 -2e-3 9.1796e-4 -2e-3 0.00205l6e-5 0.017813c0 4.2697e-4 1.4e-4 8.2175e-4 3.6e-4 0.001148 3.3e-4 2.2285e-4 7.2e-4 3.5451e-4 1e-3 3.5519e-4l0.0178 3.06e-5c1e-3 2e-6 2e-3 -9.0731e-4 2e-3 -0.002039l3e-5 -0.017813c0-4.5415e-4 -1.4e-4 -8.7301e-4 -3.9e-4 -0.001212-3.4e-4 -2.4769e-4 -7.6e-4 -3.938e-4 -1e-3 -3.9244e-4zm-0.58548 0.017822-4.1e-4 0.009708-0.01 4.004e-4 0.0874 0.086872c2e-3 -0.002153 3e-3 -0.003709 4e-3 -0.005111 1e-3 -0.001361 3e-3 -0.002673 5e-3 -0.004374zm0.55919 0-0.0867 0.087496c2e-3 0.001701 4e-3 0.003012 5e-3 0.004374 1e-3 0.001402 3e-3 0.002958 4e-3 0.005111l0.0874-0.086872-0.01-4.0041e-4zm-0.29151 0.023644c-5.8e-4 6.3303e-4 -1e-3 0.001546-2e-3 0.001852 3e-3 9.7219e-4 6e-3 0.006808 3e-3 0.010236-3e-3 0.004165-9e-3 9.4135e-4 -0.0133-0.001622-5e-3 -0.003159-7e-3 -0.009754-0.0117-0.008965 2e-3 0.002512 2e-3 0.007188-6e-5 0.011448-7.3e-4 0.001091-3e-3 0.001199-7e-3 0.001161-4e-3 -3.21e-5 -7e-3 -2.3363e-4 -0.0129 0.001223-0.0101 0.002578-0.0153 0.009771-0.0229 0.01496-9.7e-4 -0.001063 4.5e-4 -0.003237 2.7e-4 -0.006468-2.9e-4 -0.005169-5e-3 -0.006382-9e-3 -0.005612-4e-3 6.9008e-4 -9e-3 0.002996-8e-3 0.009551 7.1e-4 0.011097 8e-3 0.014621 0.0113 0.014737 7e-3 2.1366e-4 0.0168-0.005864 0.023-0.011748 3e-3 -0.002757 6e-3 -0.005355 0.0108-0.005171-2e-3 0.006988-5e-4 0.011268 3e-3 0.014221-4.9e-4 -8.6642e-4 0.0103-0.01582 0.0227-0.010527 0.0166 0.007065 8e-3 0.024166 8e-3 0.024168 0.0103 0.008196 0.014 0.018406 0.017 0.028913 1.2e-4 4.0742e-4 1.8e-4 7.558e-4 2.1e-4 0.001092 2e-5 -5.7376e-4 1.3e-4 -0.001092 1.3e-4 -0.001092 3e-3 -0.010507 7e-3 -0.020717 0.017-0.028913-3e-5 -2e-6 -8e-3 -0.017104 8e-3 -0.024168 0.0124-0.005293 0.0232 0.009661 0.0227 0.010527 4e-3 -0.002953 6e-3 -0.007233 3e-3 -0.014221 5e-3 -1.841e-4 8e-3 0.002413 0.0108 0.005171 6e-3 0.005883 0.0164 0.011961 0.023 0.011748 4e-3 -1.152e-4 0.0106-0.003639 0.0113-0.014737 4.2e-4 -0.006555-4e-3 -0.008861-8e-3 -0.009551-5e-3 -7.6946e-4 -9e-3 4.4349e-4 -0.01 0.005612-1.8e-4 0.00323 1e-3 0.005404 2.6e-4 0.006468-8e-3 -0.005189-0.0128-0.012382-0.0229-0.01496-6e-3 -0.001456-9e-3 -0.001255-0.0129-0.001223-5e-3 3.76e-5 -6e-3 -7e-5 -7e-3 -0.001161-2e-3 -0.00426-2e-3 -0.008936-6e-5 -0.011448-4e-3 -7.8935e-4 -7e-3 0.005805-0.0117 0.008965-4e-3 0.002563-0.0102 0.005786-0.0133 0.001622-2e-3 -0.003429 1e-4 -0.009264 3e-3 -0.010236-1e-3 -3.0602e-4 -2e-3 -0.001219-2e-3 -0.001852h-0.0102zm-0.11651 0.033265c-0.0168 0.005974-0.0256 0.012794-0.0475 0.033545-7e-3 -3.8645e-4 -0.0134 0.001665-0.0178 0.005679-4e-3 0.004376-6e-3 0.010658-6e-3 0.017775-0.0208 0.021842-0.0276 0.030641-0.0336 0.047466 5e-3 0.003213 7e-3 0.003968 0.012 0.004801 4e-3 -0.009593 6e-3 -0.019859 0.0304-0.042261 0.0108-0.001104 0.0194 0.001764 0.0292 0.004499-3e-3 -0.009757-6e-3 -0.018395-5e-3 -0.029163 0.0224-0.024896 0.0327-0.026218 0.0423-0.030358-8.2e-4 -0.004768-2e-3 -0.006527-5e-3 -0.011983zm0.25684 0c-3e-3 0.005456-4e-3 0.007215-5e-3 0.011983 0.01 0.00414 0.0199 0.005462 0.0423 0.030358 1e-3 0.010768-2e-3 0.019406-5e-3 0.029163 0.01-0.002735 0.0184-0.005603 0.0292-0.004499 0.0249 0.022401 0.0263 0.032668 0.0304 0.042261 5e-3 -8.3283e-4 6e-3 -0.001588 0.012-0.004801-6e-3 -0.016825-0.0128-0.025624-0.0336-0.047466 3.7e-4 -0.007116-2e-3 -0.013399-6e-3 -0.017775-4e-3 -0.004013-0.0107-0.006065-0.0178-0.005679-0.0219-0.020751-0.0307-0.027571-0.0475-0.033545zm-0.16167 6.7843e-4c-1e-3 -7e-6 -3e-3 4.04e-5 -4e-3 7.05e-5 6e-3 0.004005 5e-3 0.007934 4e-3 0.011532-2e-3 0.006727-8e-3 0.008438-0.0127 0.011673 4e-3 0.004168 0.0105 0.005224 0.0112 0.015596 4.6e-4 0.006839-4e-3 0.010743-7e-3 0.015236 7e-3 0.004435 0.0152 0.007972 0.0153 0.019008 8e-5 0.009545-7e-3 0.013354-0.0133 0.0176 7e-3 0.002879 0.0118 0.008245 0.0121 0.018067 2.2e-4 0.008502-4e-3 0.013263-8e-3 0.018196l0.0189 0.009165c3e-3 -0.001021 7e-3 -0.001928 0.0117-0.001232v-0.081972c-4e-3 -0.013264-0.0105-0.024538-0.0226-0.030574 2e-3 -0.00331 5e-3 -0.007666 5e-3 -0.013724-9.8e-4 -0.007604-6e-3 -0.008617-0.011-0.008644zm0.0665 0c-5e-3 2.67e-5 -0.0101 0.00104-0.011 0.008644-7.8e-4 0.006058 2e-3 0.010414 5e-3 0.013724-0.0122 0.006035-0.0185 0.017308-0.0226 0.030574v0.081972c5e-3 -6.9606e-4 8e-3 2.1107e-4 0.0117 0.001232l0.0189-0.009165c-4e-3 -0.004933-8e-3 -0.009693-8e-3 -0.018196 2.6e-4 -0.009822 5e-3 -0.015188 0.0121-0.018067-6e-3 -0.004246-0.0133-0.008056-0.0133-0.0176 9e-5 -0.011036 8e-3 -0.014573 0.0153-0.019008-3e-3 -0.004493-7e-3 -0.008398-7e-3 -0.015236 7e-4 -0.010373 7e-3 -0.011428 0.0112-0.015596-5e-3 -0.003235-0.0106-0.004945-0.0127-0.011673-1e-3 -0.003599-2e-3 -0.007527 4e-3 -0.011532-1e-3 -3.01e-5 -2e-3 -7.66e-5 -4e-3 -7.05e-5zm-0.29022 0.002134c-0.0358 0.038773-0.0619 0.08487-0.0768 0.13457l0.0158 0.00413c0.0141-0.046864 0.0387-0.090353 0.0724-0.12703zm0.51391 0-0.0115 0.011675c0.0337 0.036674 0.0583 0.080163 0.0724 0.12703l0.0158-0.00413c-0.0149-0.049702-0.041-0.0958-0.0768-0.13457zm-0.41264 0.039518-4e-3 0.003491c3e-3 0.008695 6e-3 0.018349 7e-3 0.029011 8e-3 -0.006765 0.0145-0.007949 0.0215-0.01035zm0.31137 0-0.0246 0.022153c7e-3 0.0024 0.0134 0.003584 0.0215 0.01035 1e-3 -0.010662 4e-3 -0.020317 7e-3 -0.029011zm-0.34286 0.031148-3e-3 0.003789 0.0221 0.024599c2e-3 -0.007011 4e-3 -0.01341 0.0104-0.021468-0.0107-0.001311-0.0203-0.003869-0.029-0.00692zm0.37435 0c-9e-3 0.003051-0.0183 0.005609-0.029 0.00692 7e-3 0.008058 8e-3 0.014456 0.0104 0.021468l0.0221-0.024599zm-0.31527 0.001731c-0.0191 0-0.0347 0.015604-0.0347 0.03469 0 0.003661 5.8e-4 0.007192 2e-3 0.010512l-0.0373 0.032601c-4e-3 -0.001645-8e-3 -0.002559-0.013-0.002559-0.0191 1e-8 -0.0347 0.015604-0.0347 0.03469 0 0.013418 8e-3 0.025108 0.0189 0.030871v0.037758c-0.0112 0.005764-0.0189 0.017453-0.0189 0.030871 0 0.019086 0.0156 0.03469 0.0347 0.03469 5e-3 0 9e-3 -9.1396e-4 0.013-0.002559l0.0373 0.032601c-1e-3 0.003319-2e-3 0.006851-2e-3 0.010512 0 0.019086 0.0156 0.03469 0.0347 0.03469 0.0179 0 0.0327-0.01372 0.0345-0.03116l0.0812-0.038523c2e-3 0.001563 9e-3 0.00266 0.0123 0.002623v9e-6c3e-5 6.3e-7 8e-5 0 1.1e-4 0 3e-5 -7.4e-7 7e-5 0 1e-4 0v-9e-6c3e-3 3.64e-5 0.0104-0.00106 0.0123-0.002623l0.0812 0.038523c2e-3 0.017439 0.0166 0.03116 0.0345 0.03116 0.0191 0 0.0347-0.015604 0.0347-0.03469 0-0.003661-5.8e-4 -0.007192-2e-3 -0.010512l0.0373-0.032601c4e-3 0.001645 8e-3 0.002559 0.013 0.002559 0.0191 0 0.0347-0.015604 0.0347-0.03469 0-0.013418-8e-3 -0.025108-0.0189-0.030871v-0.037759c0.0112-0.005764 0.0189-0.017453 0.0189-0.030871 0-0.019086-0.0156-0.03469-0.0347-0.03469-5e-3 0-9e-3 9.1404e-4 -0.013 0.002559l-0.0373-0.032601c1e-3 -0.003319 2e-3 -0.006851 2e-3 -0.010512 0-0.019086-0.0156-0.03469-0.0347-0.03469-0.0179 0-0.0327 0.01372-0.0345 0.03116l-0.0812 0.038523c-4e-3 -0.001434-6e-3 -0.001864-0.0123-0.00193v-2e-6c-2e-5 2.6e-7 -4e-5 9.1e-7 -7e-5 9.1e-7 -2e-5 -2.6e-7 -4e-5 -9.1e-7 -7e-5 -9.1e-7v2e-6c-6e-3 6.64e-5 -8e-3 4.9636e-4 -0.0124 0.00193l-0.0812-0.038523c-2e-3 -0.017439-0.0166-0.03116-0.0345-0.03116zm0 0.01226c0.0125 0 0.0224 0.009967 0.0224 0.022424v7e-6c0 0.012461-0.01 0.02243-0.0224 0.02243-0.0125 0-0.0224-0.00997-0.0224-0.02243 0-0.012461 0.01-0.02243 0.0224-0.022431zm0.25619 0c0.0125 0 0.0224 0.00997 0.0224 0.02243 0 0.01246-0.01 0.02243-0.0224 0.02243-0.0125 0-0.0224-0.00997-0.0224-0.02243v-7e-6c1e-5 -0.012457 0.01-0.022424 0.0224-0.022423zm-0.39972 0.008298c-0.0112 0.01389-0.0152 0.024307-0.023 0.05343-6e-3 0.003388-0.0106 0.008423-0.0122 0.014135-1e-3 0.005832 3.9e-4 0.012266 4e-3 0.018138-6e-3 0.029484-7e-3 0.040557-4e-3 0.058038 6e-3 -1.0864e-4 8e-3 -3.8254e-4 0.0127-0.002163-1e-3 -0.01035-6e-3 -0.019803 4e-3 -0.05193 9e-3 -0.006569 0.0175-0.008635 0.0272-0.011399-7e-3 -0.006899-0.0144-0.01277-0.019-0.022539 6e-3 -0.032952 0.0142-0.039446 0.0202-0.047992-3e-3 -0.003634-5e-3 -0.00474-0.0103-0.007718zm0.54326 0c-6e-3 0.002978-7e-3 0.004084-0.0103 0.007718 6e-3 0.008545 0.0141 0.015039 0.0202 0.047992-5e-3 0.009767-0.0116 0.015639-0.019 0.022539 0.01 0.002764 0.0186 0.00483 0.0272 0.011399 0.01 0.032127 5e-3 0.04158 4e-3 0.05193 5e-3 0.00178 6e-3 0.002054 0.0127 0.002163 4e-3 -0.017481 2e-3 -0.028554-4e-3 -0.058038 4e-3 -0.005872 6e-3 -0.012306 4e-3 -0.018138-2e-3 -0.005712-6e-3 -0.010747-0.0122-0.014135-8e-3 -0.029123-0.0118-0.03954-0.023-0.05343zm-0.71725 0.019457c-3.9e-4 -1.85e-5 -7.9e-4 7.61e-5 -1e-3 2.9666e-4l-0.0152 0.009257c-3.9e-4 2.3599e-4 -6.7e-4 5.7864e-4 -8.3e-4 9.671e-4 -3e-5 4.1861e-4 6e-5 8.5166e-4 3e-4 0.001238l9e-3 0.015173c5.9e-4 9.6411e-4 2e-3 0.001262 3e-3 6.6913e-4l0.0152-0.009334c3.6e-4 -2.2373e-4 6.3e-4 -5.4124e-4 8e-4 -9.0191e-4 2e-5 -3.949e-4 -8e-5 -7.9919e-4 -3e-4 -0.001164l-9e-3 -0.015221c-3.7e-4 -6.0446e-4 -1e-3 -9.4963e-4 -2e-3 -9.8038e-4zm0.89124 0c-6.5e-4 3.08e-5 -1e-3 3.7595e-4 -2e-3 9.8039e-4l-9e-3 0.015221c-2.2e-4 3.6479e-4 -3.2e-4 7.6909e-4 -3e-4 0.001164 1.7e-4 3.6067e-4 4.3e-4 6.7819e-4 8e-4 9.0192e-4l0.0152 0.009334c9.6e-4 5.9314e-4 2e-3 2.9503e-4 3e-3 -6.6911e-4l9e-3 -0.015173c2.4e-4 -3.8682e-4 3.3e-4 -8.1986e-4 3e-4 -0.001238-1.6e-4 -3.8846e-4 -4.4e-4 -7.311e-4 -8.3e-4 -9.671e-4l-0.0152-0.009257c-3.6e-4 -2.2059e-4 -7.7e-4 -3.1511e-4 -1e-3 -2.9666e-4zm-0.54046 0.004438c0.0316 0.0137 0.0632 0.027402 0.0948 0.041102 4e-5 1.0537e-4 1.4e-4 7e-6 2.2e-4 -4.07e-5 0.0316-0.013688 0.0631-0.027374 0.0947-0.041062 1e-3 0.003443 3e-3 0.006721 5e-3 0.009694 6e-5 2.1864e-4 5e-4 5.3235e-4 3.6e-4 6.8156e-4 -0.0275 0.012082-0.055 0.024165-0.0824 0.036247-3e-3 -0.00231-6e-3 -0.003853-0.0101-0.004641-2e-3 -5.3294e-4 -5e-3 -7.6078e-4 -7e-3 -8.2692e-4 -3e-3 9.3e-5 -6e-3 4.2005e-4 -9e-3 0.001241-3e-3 8.5299e-4 -6e-3 0.002273-8e-3 0.004227l-0.0825-0.03628c2e-3 -0.00221 3e-3 -0.004572 4e-3 -0.007072 4.4e-4 -0.001068 8.3e-4 -0.002165 1e-3 -0.003271zm-0.33542 0.006571 5e-3 0.008494-8e-3 0.005414 0.11988 0.028426c3.3e-4 -0.002726 6.4e-4 -0.004738 1e-3 -0.006646 4.9e-4 -0.001894 1e-3 -0.003826 2e-3 -0.006403zm0.86052 0-0.11967 0.029286c9.5e-4 0.002576 2e-3 0.004508 2e-3 0.006403 4.3e-4 0.001908 7.4e-4 0.00392 1e-3 0.006646l0.11988-0.028426-8e-3 -0.005414zm-0.58782 0.001906c2e-3 0.003247 5e-3 0.00613 7e-3 0.00855l-0.0322 0.029992c-2e-3 -0.003649-5e-3 -0.006849-9e-3 -0.009415 0.0111-0.009708 0.0222-0.019418 0.0334-0.029126zm0.31512 0c0.0111 0.009708 0.0222 0.019418 0.0334 0.029126-4e-3 0.002566-6e-3 0.005767-9e-3 0.009415l-0.0322-0.029992c3e-3 -0.00242 6e-3 -0.005303 7e-3 -0.00855zm-0.25785 0.002406c0.0221 0.021919 0.0442 0.043837 0.0662 0.065756-4.1e-4 0.003026-4.2e-4 0.006105-2e-5 0.009132 8.2e-4 0.006257 3e-3 0.012269 7e-3 0.017174 4e-3 0.005384 0.0103 0.009461 0.0169 0.011464 1e-3 3.2583e-4 2e-3 6.0017e-4 3e-3 8.2213e-4 -6e-3 0.001222-0.0118 0.004135-0.0164 0.008314-4e-3 0.003542-7e-3 0.007978-9e-3 0.012882-2e-3 0.004813-3e-3 0.010069-2e-3 0.015239 6e-5 7.2073e-4 1.3e-4 0.00144 2.3e-4 0.002157l-0.0662 0.065756c-2e-3 -0.002914-5e-3 -0.005483-8e-3 -0.007594 0.0224-0.022396 0.0448-0.044792 0.0673-0.067188-3e-3 -0.003289-5e-3 -0.007071-6e-3 -0.010924-4e-4 -9.6199e-4 -7.8e-4 -0.001932-1e-3 -0.002909-0.0136 0.003276-0.0271 0.006552-0.0407 0.009828 1e-3 0.006316 4e-3 0.012287 7e-3 0.017883 3e-3 0.004551 5e-3 0.008907 8e-3 0.013323-0.0168-0.006324-0.0332-0.013859-0.0485-0.023253-0.0184 0.004453-0.0369 0.008906-0.0553 0.013358-3.1e-4 -0.003757-1e-3 -0.007458-3e-3 -0.010916l0.0451-0.011056c-0.0103-0.007355-0.0198-0.015678-0.0285-0.024906 9e-3 -0.009228 0.0182-0.01755 0.0285-0.024906-0.015-0.003685-0.03-0.00737-0.0451-0.011056 2e-3 -0.003458 2e-3 -0.007159 3e-3 -0.010916 0.0184 0.004453 0.0369 0.008906 0.0553 0.013358 0.0153-0.009394 0.0317-0.016929 0.0485-0.023253-5e-3 0.007025-9e-3 0.013945-0.0125 0.021651-1e-3 0.003087-2e-3 0.006284-3e-3 0.009555l0.0407 0.009828c2e-3 -0.004277 4e-3 -0.008489 6e-3 -0.012261 3.7e-4 -5.3663e-4 7.6e-4 -0.001062 1e-3 -0.001573-0.0224-0.022396-0.0448-0.044792-0.0673-0.067188 3e-3 -0.00211 6e-3 -0.004682 8e-3 -0.007591zm0.20058 0c2e-3 0.002903 5e-3 0.005482 8e-3 0.007591l-0.0673 0.067188c3e-3 0.003289 5e-3 0.007071 6e-3 0.010924 4e-4 9.62e-4 7.8e-4 0.001932 1e-3 0.002909 0.0136-0.003276 0.0271-0.006552 0.0407-0.009828-1e-3 -0.006316-4e-3 -0.012287-7e-3 -0.017883-3e-3 -0.004551-5e-3 -0.008907-8e-3 -0.013323 0.0168 0.006324 0.0332 0.013859 0.0485 0.023253 0.0184-0.004453 0.0369-0.008906 0.0553-0.013358 3.1e-4 0.003756 1e-3 0.00746 3e-3 0.010916-0.015 0.003685-0.03 0.00737-0.0451 0.011056 0.0103 0.007355 0.0198 0.015678 0.0285 0.024906-9e-3 0.009228-0.0182 0.01755-0.0285 0.024906 0.015 0.003685 0.0301 0.00737 0.0451 0.011056-1e-3 0.003456-2e-3 0.00716-3e-3 0.010916-0.0184-0.004453-0.0369-0.008906-0.0553-0.013358-0.0153 0.009394-0.0317 0.01693-0.0485 0.023253 5e-3 -0.007025 9e-3 -0.013945 0.0125-0.021651 1e-3 -0.003087 2e-3 -0.006284 3e-3 -0.009555l-0.0407-0.009828c-2e-3 0.004277-4e-3 0.008489-6e-3 0.012261-3.7e-4 5.3663e-4 -7.6e-4 0.001062-1e-3 0.001573 0.0224 0.022396 0.0448 0.044792 0.0673 0.067188-3e-3 0.002111-6e-3 0.004686-8e-3 0.007594-0.0221-0.021919-0.0442-0.043837-0.0662-0.065756 4.1e-4 -0.003026 4.2e-4 -0.006105 2e-5 -0.009132-8.2e-4 -0.006257-3e-3 -0.012269-7e-3 -0.017174-4e-3 -0.005411-0.0103-0.009501-0.017-0.011495-1e-3 -3.1261e-4 -2e-3 -5.7683e-4 -3e-3 -7.9189e-4 6e-3 -0.001222 0.0118-0.004135 0.0164-0.008314 4e-3 -0.003542 7e-3 -0.007978 9e-3 -0.012882 2e-3 -0.004788 3e-3 -0.010012 2e-3 -0.015156-6e-5 -7.4845e-4 -1.3e-4 -0.001496-2.3e-4 -0.00224 0.0221-0.02192 0.0442-0.043839 0.0662-0.065759zm-0.37304 0.01556-1e-3 0.004958c7e-3 0.005827 0.0143 0.012731 0.021 0.021146 3e-3 -0.009984 8e-3 -0.014337 0.0129-0.02005zm0.54551 0-0.0325 0.006054c5e-3 0.005712 0.01 0.010065 0.0129 0.02005 7e-3 -0.008415 0.0139-0.015319 0.021-0.021146zm-0.48425 0.016607c0.0125 0 0.0224 0.009967 0.0224 0.022424v7e-6c0 0.012461-0.01 0.02243-0.0224 0.02243-0.0125 0-0.0224-0.00997-0.0224-0.02243 0-0.012461 0.01-0.02243 0.0224-0.022431zm0.42299 0c0.0125 0 0.0224 0.00997 0.0224 0.02243 0 0.012461-0.01 0.02243-0.0224 0.02243-0.0125 0-0.0224-0.00997-0.0224-0.02243v-7e-6c1e-5 -0.012457 0.01-0.022424 0.0224-0.022423zm-0.55427 0.012727c-3e-3 0.019581-5e-3 0.039551-5e-3 0.059705 0 0.017439 1e-3 0.034742 4e-3 0.051775l0.0156-0.006029c-2e-3 -0.01507-3e-3 -0.030352-3e-3 -0.045746 0-0.01926 2e-3 -0.038345 5e-3 -0.057056zm0.68555 0-0.0161 0.002649c3e-3 0.018711 5e-3 0.037796 5e-3 0.057056 0 0.015395-1e-3 0.030676-3e-3 0.045746l0.0156 0.006029c3e-3 -0.017032 4e-3 -0.034335 4e-3 -0.051775 0-0.020153-2e-3 -0.040123-5e-3 -0.059705zm-0.34278 0.002877c0.0122 3.1006e-4 0.0221 0.010337 0.0221 0.0226 0 0.012263-0.01 0.02192-0.0221 0.022228-0.0122-3.0953e-4 -0.0221-0.009966-0.0221-0.022228 0-0.012263 0.01-0.022289 0.0221-0.0226zm-0.255 0.001552c-0.01 0.004452-0.0193 0.007313-0.0283 0.009252l-1e-3 0.005058 0.0317 0.00942c-2e-3 -0.007238-4e-3 -0.013317-2e-3 -0.023729zm0.50999 0c2e-3 0.010412-7.5e-4 0.016491-2e-3 0.023729l0.0317-0.00942-1e-3 -0.005058c-9e-3 -0.001939-0.0186-0.0048-0.0283-0.009252zm-0.47407 0.039114c2e-3 5.5057e-4 5e-3 8.5004e-4 8e-3 8.5004e-4 2e-3 0 3e-3 -1.274e-4 5e-3 -3.6581e-4v0.030851c-2e-3 -2.3842e-4 -3e-3 -3.6581e-4 -5e-3 -3.6581e-4 -3e-3 0-5e-3 2.9944e-4 -8e-3 8.5002e-4v-0.017477zm0.43816 0v0.031819c-2e-3 -5.5057e-4 -5e-3 -8.5002e-4 -8e-3 -8.5002e-4 -2e-3 0-3e-3 1.2739e-4 -5e-3 3.6581e-4v-0.030851c2e-3 2.3841e-4 3e-3 3.6582e-4 5e-3 3.6582e-4 3e-3 0 5e-3 -2.9947e-4 8e-3 -8.4981e-4zm-0.31071 0.00155c-7.5e-4 0.00436-1e-3 0.009106-1e-3 0.01436-1.1e-4 0.005254 2.7e-4 0.01 1e-3 0.01436l0.0412-0.009704c-1.5e-4 -0.001439-5.1e-4 -0.003187-5.5e-4 -0.004656 4e-5 -0.001469 4e-4 -0.003217 5.5e-4 -0.004656zm0.18326 0-0.0412 0.009704c1.5e-4 0.001438 5.1e-4 0.003187 5.5e-4 0.004656-4e-5 0.001469-4e-4 0.003217-5.5e-4 0.004656l0.0412 0.009704c7.5e-4 -0.00436 1e-3 -0.009106 1e-3 -0.01436 1.1e-4 -0.005254-2.7e-4 -0.01-1e-3 -0.01436zm-0.0916 0.025736c0.0122 3.1009e-4 0.0221 0.010338 0.0221 0.022601s-0.01 0.021918-0.0221 0.022228c-0.0122-3.0948e-4 -0.0221-0.009965-0.0221-0.022228 0-0.012263 0.01-0.02229 0.0221-0.022601zm-0.21149 0.015943c0.0125 0 0.0224 0.00997 0.0224 0.02243v9e-6c-1e-5 0.012457-0.01 0.022424-0.0224 0.022424-0.0125 0-0.0224-0.00997-0.0224-0.02243 0-0.01246 0.01-0.02243 0.0224-0.02243zm0.42298 0c0.0125 0 0.0224 0.00997 0.0224 0.02243 0 0.012461-0.01 0.02243-0.0224 0.02243-0.0125 0-0.0224-0.009967-0.0224-0.022424v-9e-6c0-0.012461 0.01-0.02243 0.0224-0.02243zm-0.46063 0.008804s-0.0462 0.010196-0.0689 0.018087c-0.0344 0.011973-0.1007 0.04265-0.1007 0.04265l0.16789-0.039567c-6.2e-4 -0.007219-2e-3 -0.014703 2e-3 -0.021171zm0.49828 0c4e-3 0.006468 2e-3 0.013952 2e-3 0.021171l0.16789 0.039567s-0.0663-0.030677-0.1007-0.04265c-0.0227-0.007892-0.0689-0.018087-0.0689-0.018087zm-0.49849 0.027388-0.16749 0.041237s0.073-0.002871 0.10907-0.007892c0.0238-0.00331 0.0696-0.015275 0.0696-0.015275-7e-3 -0.00384-8e-3 -0.011361-0.0112-0.01807zm0.49869 0c-3e-3 0.00671-4e-3 0.01423-0.0112 0.01807 0 0 0.0458 0.011965 0.0696 0.015275 0.0361 0.005022 0.10908 0.007892 0.10908 0.007892zm-0.43154 0.004702 0.0322 0.029992c-3e-3 0.00242-5e-3 0.005303-7e-3 0.00855-0.0111-0.009709-0.0222-0.019418-0.0334-0.029126 4e-3 -0.002566 6e-3 -0.005767 9e-3 -0.009415zm0.36439 0c2e-3 0.003649 5e-3 0.006849 9e-3 0.009415-0.0111 0.009709-0.0222 0.019418-0.0334 0.029126-2e-3 -0.003247-5e-3 -0.00613-7e-3 -0.00855zm-0.19955 3.9647e-4c5e-3 0.00415 0.0114 0.004933 0.0173 0.00509v9e-6c2e-5 -5.5e-7 4e-5 0 6e-5 0 2e-5 4.5e-7 4e-5 0 6e-5 0v-9e-6c6e-3 -1.5681e-4 0.012-9.3972e-4 0.0173-0.00509l0.0825 0.03628c-2.8e-4 3.8628e-4 -3.4e-4 5.0522e-4 -6.1e-4 9.0323e-4 -1e-5 1.18e-5 -1e-5 2.18e-5 -2e-5 3.36e-5s-2e-5 2.54e-5 -3e-5 3.91e-5c-2.4e-4 3.7417e-4 -4.9e-4 7.5326e-4 -7.2e-4 0.001137-3e-5 4.45e-5 -5e-5 8.82e-5 -8e-5 1.3304e-4 -2.2e-4 3.6262e-4 -4.3e-4 7.2904e-4 -6.4e-4 0.0011-4e-5 6.64e-5 -7e-5 1.3368e-4 -1.1e-4 2.0092e-4 -2e-4 3.5962e-4 -3.9e-4 7.236e-4 -5.7e-4 0.001091-4e-5 7.01e-5 -7e-5 1.3895e-4 -1.1e-4 2.0883e-4 -1.7e-4 3.4705e-4 -3.3e-4 6.9757e-4 -4.9e-4 0.001051-5e-5 1.0614e-4 -1e-4 2.1121e-4 -1.5e-4 3.1793e-4 -1.4e-4 3.2395e-4 -2.7e-4 6.5155e-4 -4.1e-4 9.8049e-4 -5e-5 1.2558e-4 -1e-4 2.5006e-4 -1.5e-4 3.7645e-4 -1.5e-4 3.8901e-4 -3e-4 7.8164e-4 -4.3e-4 0.001177-2e-5 5.37e-5 -4e-5 1.0603e-4 -6e-5 1.597e-4 0 9e-6 -1e-5 1.28e-5 -1e-5 1.82e-5 -1.6e-4 4.6771e-4 -3.1e-4 9.39e-4 -4.5e-4 0.001415l-0.0948-0.041473v-5.46e-5l-7e-5 2.64e-5 -6e-5 -2.64e-5v5.46e-5l-0.0948 0.041473c-1.4e-4 -4.7636e-4 -2.9e-4 -9.4765e-4 -4.5e-4 -0.001415v-1.82e-5c-2e-5 -5.37e-5 -4e-5 -1.0614e-4 -6e-5 -1.597e-4 -1.4e-4 -3.9557e-4 -2.8e-4 -7.882e-4 -4.4e-4 -0.001177-5e-5 -1.2632e-4 -1e-4 -2.508e-4 -1.5e-4 -3.7637e-4 -1.3e-4 -3.2903e-4 -2.7e-4 -6.5654e-4 -4.1e-4 -9.8049e-4 -5e-5 -1.0679e-4 -1e-4 -2.1173e-4 -1.4e-4 -3.1793e-4 -1.6e-4 -3.5333e-4 -3.3e-4 -7.0385e-4 -5e-4 -0.001051-3e-5 -7.01e-5 -7e-5 -1.3923e-4 -1e-4 -2.0891e-4 -1.9e-4 -3.6718e-4 -3.8e-4 -7.3115e-4 -5.8e-4 -0.001091-3e-5 -6.74e-5 -7e-5 -1.3385e-4 -1.1e-4 -2.0083e-4 -2e-4 -3.71e-4 -4.2e-4 -7.3751e-4 -6.3e-4 -0.0011-3e-5 -4.45e-5 -6e-5 -8.92e-5 -9e-5 -1.3304e-4 -2.3e-4 -3.8409e-4 -4.7e-4 -7.6326e-4 -7.2e-4 -0.001137-1e-5 -1.28e-5 -2e-5 -2.64e-5 -2e-5 -3.91e-5 -1e-5 -1.09e-5 -2e-5 -2.18e-5 -3e-5 -3.36e-5 -2.6e-4 -3.9791e-4 -3.2e-4 -5.1693e-4 -6.1e-4 -9.0313e-4zm4e-3 0.03018-0.0122 0.005562 1.1e-4 0.34934c5e-3 0.021727 0.0124 0.043388 0.0212 0.062683v-0.41759zm0.0182 0v0.41759c9e-3 -0.019296 0.0161-0.040956 0.0212-0.062683l1.1e-4 -0.34934-0.0122-0.005562zm-0.13265 0.003774c0.0125 0 0.0224 0.00997 0.0224 0.02243v9e-6c0 0.012457-0.01 0.022424-0.0224 0.022424-0.0125 0-0.0224-0.00997-0.0224-0.02243 0-0.012461 0.01-0.02243 0.0224-0.02243zm0.25619 0c0.0125 0 0.0224 0.00997 0.0224 0.02243 0 0.01246-0.01 0.02243-0.0224 0.02243-0.0125 0-0.0224-0.009967-0.0224-0.022424v-9e-6c0-0.012461 0.01-0.02243 0.0224-0.02243zm-0.44155 0.005003-0.0165 0.002319c0.0145 0.042738 0.0374 0.08252 0.0677 0.11689l0.01-0.013977c-0.0268-0.031218-0.0474-0.066949-0.0608-0.10524zm0.62691 0c-0.0134 0.038285-0.0339 0.074016-0.0608 0.10524l0.01 0.013977c0.0303-0.034372 0.0532-0.074154 0.0677-0.11689zm-0.48098 0.02567s-0.0341 0.032837-0.0493 0.051423c-0.0231 0.0282-0.0636 0.088984-0.0636 0.088984l0.12248-0.12146c-4e-3 -0.00583-0.01-0.011231-0.01-0.018946zm0.33505 0c2.1e-4 0.007715-5e-3 0.013115-0.01 0.018945l0.12248 0.12146s-0.0405-0.060784-0.0636-0.088984c-0.0152-0.018588-0.0493-0.051423-0.0493-0.051422zm-0.32109 0.023291-0.12127 0.12268s0.0607-0.040576 0.0889-0.063723c0.0186-0.015257 0.0513-0.049379 0.0513-0.049379-8e-3 2.2384e-4 -0.0131-0.005283-0.019-0.009575zm0.30713 0c-6e-3 0.004292-0.0112 0.009799-0.019 0.009575 0 0 0.0328 0.034122 0.0513 0.049379 0.0282 0.023147 0.0889 0.063723 0.0889 0.063723zm-0.36895 0.093234-0.014 0.009553c0.0542 0.046982 0.12172 0.076073 0.19313 0.083422v-0.016434c-0.0661-0.007131-0.1285-0.033775-0.17915-0.07654zm0.43078 0c-0.0507 0.042765-0.11311 0.069409-0.17915 0.07654v0.016434c0.0714-0.007348 0.13894-0.03644 0.19313-0.083422z"
                  />
                </svg>
              </div>
              {{ $t(link.translationKey) }}
            </router-link>
          </div>
        </section>
        <section class="details__share">
          <h3>{{ $t('ui.share') }}</h3>
          <a
            class="share-button share-button--tumblr"
            :href="tumblrShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.tumblr.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="tumblrLogo" alt="" aria-hidden="true" />
            </span>
            <span class="share-button__text">{{ $t('sharing.tumblr.button-text') }}</span>
          </a>
          <a
            class="share-button share-button--reddit"
            :href="redditShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.reddit.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="redditLogo" alt="" aria-hidden="true" />
            </span>
            <span class="share-button__text">{{ $t('sharing.reddit.button-text') }}</span>
          </a>
          <a
            class="share-button share-button--twitter"
            :href="twitterShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.twitter.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="xLogo" alt="" aria-hidden="true" />
            </span>
            <span class="share-button__text">{{ $t('sharing.twitter.button-text') }}</span>
          </a>
          <a
            href="#"
            role="button"
            class="share-button share-button--instagram"
            :aria-label="$t('sharing.instagram.button-text')"
            @click.prevent="shareInstagram"
            @keydown.enter.prevent="shareInstagram"
            @keydown.space.prevent="shareInstagram"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="instagramLogo" alt="" aria-hidden="true" />
            </span>
            <span class="share-button__text">{{ $t('sharing.instagram.button-text') }}</span>
          </a>
          <a
            class="share-button share-button--facebook"
            :href="facebookShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.facebook.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="facebookLogo" alt="" aria-hidden="true" />
            </span>
            <span class="share-button__text">{{ $t('sharing.facebook.button-text') }}</span>
          </a>
          <a
            href="#"
            role="button"
            class="share-button share-button--general"
            :aria-label="$t('sharing.general.button-text')"
            @click.prevent="shareGenerally"
            @keydown.enter.prevent="shareGenerally"
            @keydown.space.prevent="shareGenerally"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="shareLogo" alt="" aria-hidden="true" />
            </span>
            <span class="share-button__text">
              {{ generalShareLabel }}
            </span>
          </a>
        </section>
      </div>
    </Scrollbar>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import { BookIcon, CalendarIcon, HelpCircleIcon, XIcon } from 'vue-feather-icons'
import Markdown from '@/components/Markdown.vue'
import { formatDate, getEntryImageSrcSet, compareEvents } from '@/utils'
import xLogo from '@/assets/logos/x.svg'
import instagramLogo from '@/assets/logos/instagram.svg'
import facebookLogo from '@/assets/logos/facebook.svg'
import redditLogo from '@/assets/logos/reddit.svg'
import tumblrLogo from '@/assets/logos/tumblr.svg'
import shareLogo from '@/assets/share-svgrepo-com.svg'

export default {
  name: 'Details',
  components: {
    Markdown,
    HelpCircleIcon,
    XIcon,
    CalendarIcon,
    BookIcon,
    Scrollbar
  },
  props: {
    details: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      reachedHeading: false,
      imageAspect: 1,
      width: 1,
      nativeShareSupported: navigator.share !== undefined,
      shareCopied: false,
      shareCopiedTimeout: null,
      xLogo,
      instagramLogo,
      facebookLogo,
      redditLogo,
      tumblrLogo,
      shareLogo
    }
  },
  computed: {
    imageSrcSet () {
      return this.details.image !== undefined ? getEntryImageSrcSet(this.details.image.file, this.$gtag) : undefined
    },
    imageUrl () {
      return this.imageSrcSet !== undefined ? this.imageSrcSet.sources[0].url : undefined
    },
    imageCredits () {
      return this.details.image?.credits === undefined
        ? 'Credits have to be set!'
        : this.$t('ui.image-credits', { credits: this.details.image.credits })
    },
    baseTranslationKey () {
      return `${this.details.type}.${this.details.id}`
    },
    shareUrl () {
      return window.location.href
    },
    shareTitle () {
      return this.$t(`${this.baseTranslationKey}.name`)
    },
    generalShareLabel () {
      return this.shareCopied ? this.$t('sharing.general.copied') : this.$t('sharing.general.button-text')
    },
    twitterShareUrl () {
      const text = this.$t('sharing.twitter.entry-template', { entry: this.shareTitle })
      const url = encodeURIComponent(this.shareUrl)
      return `https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(text)}`
    },
    facebookShareUrl () {
      const url = encodeURIComponent(this.shareUrl)
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`
    },
    redditShareUrl () {
      const title = this.$t('sharing.reddit.entry-template', { entry: this.shareTitle })
      const url = encodeURIComponent(this.shareUrl)
      return `https://www.reddit.com/submit?url=${url}&title=${encodeURIComponent(title)}`
    },
    tumblrShareUrl () {
      const caption = this.$t('sharing.tumblr.entry-template', { entry: this.shareTitle })
      const url = encodeURIComponent(this.shareUrl)
      return `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&caption=${encodeURIComponent(caption)}`
    },
    metadata () {
      const result = {}

      if (this.details.date) {
        result.date = formatDate(this.details.date)
      }

      if (this.$te(`${this.baseTranslationKey}.chapter`, this.$i18n.fallbackLocale)) {
        result.chapter = this.$t(`${this.baseTranslationKey}.chapter`)
      }

      return result
    },
    text () {
      // Fall back from translated details to translated blurb to English details to English blurb
      if (this.$te(`${this.baseTranslationKey}.details`)) {
        return this.$t(`${this.baseTranslationKey}.details`)
      }

      if (this.$te(`${this.baseTranslationKey}.blurb`)) {
        return this.$t(`${this.baseTranslationKey}.blurb`)
      }

      if (this.$te(`${this.baseTranslationKey}.details`, this.$i18n.fallbackLocale)) {
        return this.$t(`${this.baseTranslationKey}.details`)
      }

      return this.$t(`${this.baseTranslationKey}.blurb`)
    },
    anyRelated () {
      return Object.keys(this.related).length > 0
    },
    related () {
      if (this.details.related === undefined) {
        return []
      }

      const result = this.details.related.map((link) => {
        const [type, id] = link.split('/', 2)
        const linkDetails = this.$store.state.mappings[type][id]

        if (linkDetails === undefined) {
          return {
            translationKey: 'unknown-entry',
            url: link
          }
        }

        let image
        if (linkDetails.image !== undefined) {
          image = {
            backgroundImage: getEntryImageSrcSet(linkDetails.image.file, this.$gtag).css
          }

          if (linkDetails.image.offset !== undefined) {
            image.backgroundPosition = `${linkDetails.image.offset.x}% ${linkDetails.image.offset.y}%`
          }

          if (linkDetails.image.size !== undefined) {
            image.backgroundSize = `${linkDetails.image.size}%`
          }
        }

        return {
          type,
          id,
          translationKey: `${type}.${id}.name`,
          image,
          date: linkDetails.date,
          tieBreaker: linkDetails.tieBreaker
        }
      }).reduce((acc, relatedItem) => {
        acc[relatedItem.type] = [...(acc[relatedItem.type] ?? []), relatedItem]
        return acc
      }, {})

      Object.keys(result).forEach((type) => {
        if (type === 'events') {
          result[type].sort(compareEvents)
        } else {
          result[type].sort((a, b) => this.$t(a.translationKey).localeCompare(this.$t(b.translationKey), this.$i18n.locale))
        }
      })

      return result
    }
  },
  watch: {
    imageUrl: {
      handler (newUrl) {
        if (newUrl !== undefined) {
          const image = new Image()
          image.src = newUrl

          image.onload = () => {
            this.imageAspect = image.height / image.width
            const actualHeight = this.imageAspect * this.$el.clientWidth

            if (actualHeight >= window.innerHeight) {
              this.$refs.scroller.scrollTo({ y: actualHeight * 0.5 })
            }
          }
        }
      },
      immediate: true
    }
  },
  mounted () {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.reachedHeading = entry.intersectionRatio < 1
        })
      },
      {
        root: this.$el,
        rootMargin: '0px'
      }
    )

    observer.observe(this.$refs.intersectionGuard)

    window.addEventListener('resize', this.onResize)
    this.onResize()
  },
  destroyed () {
    window.removeEventListener('resize', this.onResize)
    if (this.shareCopiedTimeout !== null) {
      window.clearTimeout(this.shareCopiedTimeout)
      this.shareCopiedTimeout = null
    }
  },
  methods: {
    onResize () {
      this.width = this.$el.clientWidth
    },
    async copyToClipboard (text) {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const el = document.createElement('textarea')
          el.value = text
          el.setAttribute('readonly', '')
          el.style.position = 'fixed'
          el.style.left = '-9999px'
          document.body.appendChild(el)
          el.select()
          document.execCommand('copy')
          document.body.removeChild(el)
        }

        this.shareCopied = true
        if (this.shareCopiedTimeout !== null) {
          window.clearTimeout(this.shareCopiedTimeout)
        }
        this.shareCopiedTimeout = window.setTimeout(() => {
          this.shareCopied = false
          this.shareCopiedTimeout = null
        }, 1500)
      } catch (e) {
        // ignore copy failures (e.g., permissions)
      }
    },
    async shareGenerally () {
      const url = this.shareUrl
      const title = this.shareTitle
      const text = this.$t('sharing.general.entry-template', { entry: title })

      if (this.nativeShareSupported) {
        try {
          await navigator.share({ title, text, url })
          return
        } catch (e) {
          // User cancellation or unsupported payload; fall through to copy
        }
      }

      await this.copyToClipboard(url)
    },
    async shareInstagram () {
      // Instagram doesn't provide a reliable web "share intent" URL.
      // Best-effort: try native share (mobile), otherwise copy the link and open Instagram.
      const url = this.shareUrl
      const title = this.shareTitle
      const text = this.$t('sharing.instagram.entry-template', { entry: title })

      if (this.nativeShareSupported) {
        try {
          await navigator.share({ title, text, url })
          return
        } catch (e) {
          // fall through to copy + open
        }
      }

      await this.copyToClipboard(url)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style lang="scss">
.details {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 80;
  width: 500px;
  max-width: 100%;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
  overflow: hidden;

  [dir=ltr] & {
    left: 0;

    &-enter {
      transform: translateX(-100%);
    }

    &-leave-to {
      transform: translateX(-100%);
    }
  }

  [dir=rtl] & {
    right: 0;

    &-enter {
      transform: translateX(100%);
    }

    &-leave-to {
      transform: translateX(100%);
    }
  }

  &-enter-active {
    transition: transform 0.75s ease-out;

    .details__image {
      transition: opacity 0.5s ease-out;
      transition-delay: 0.3s;
    }
  }

  &-enter {
    .details__image {
      opacity: 0;
    }

    .details__text, .details__share, .details__related {
      opacity: 0;
      transform: translateY(50px);
    }
  }

  &-enter-to {
    transform: translateX(0);

    .details__image {
      opacity: 1;
    }
  }

  &-leave-active {
    transition: transform 0.75s ease-in, opacity 0.75s ease-in;
  }

  &-leave {
    transform: translateX(0);
  }

  .details__close {
    position: absolute;
    top: 1rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.5s ease-in-out;
    z-index: 63;
    color: #242629;
    pointer-events: auto;
    border-radius: 100%;
    background: rgba(#F5ECDA, .0);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    padding: 0.25rem;
    line-height: 1;
    display: flex;

    [dir=ltr] & {
      right: 1rem;
      margin-left: auto;
    }

    [dir=rtl] & {
      left: 1rem;
      margin-right: auto;
    }

    &:hover, &:active, &:focus {
      color: #ffad00 !important;
    }

    &--opaque {
      color: #242629 !important;
      background: #F5ECDA;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }

  &__scroller {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    min-height: 0;
    max-height: 100%;
  }

  &__scroller:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    z-index: 62;
    pointer-events: none;
    transition: opacity 0.5s ease-in-out;
    opacity: 1;
    background: linear-gradient(0deg, rgba(#F5ECDA, 1.0) 0, rgba(#F5ECDA, 0) 100%);
    border-bottom: 1rem solid #F5ECDA;
  }

  &__content {
    background: #F5ECDA url(../assets/paper.png);
    width: 500px;
    max-width: 100%;
    padding-bottom: 4rem;

    @media (max-width: 1920px) {
      font-size: 14px;
    }
  }

  .__rail-is-vertical {
    z-index: 61 !important;
  }

  .__panel {
    z-index: 60 !important;
  }

  .__view {
    z-index: 60 !important;
    display: flex;
    align-items: stretch;
    width: auto !important;
  }

  &__image {
    position: relative;
    width: 100%;
    opacity: 1;
    margin: 0;
    padding: 0;

    &-art {
      position: relative;
      max-width: 100%;
      background-color: #0f3562;
      background-attachment: fixed;

      [dir=ltr] & {
        clip-path: polygon(0 0, 100% 0, 100% calc(100% - 2rem), 0 100%);
      }

      [dir=rtl] & {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 2rem));
        background-position-x: right;
      }
    }

    img {
      position: absolute;
      z-index: 1;
      width: 100%;
      background-repeat: no-repeat;
    }

    figcaption {
      max-width: 50%;
      z-index: 2;
      text-align: end;
      font-size: 0.8rem;
      color: color.adjust(#1c1d26, $lightness: 30%);
      margin-top: -0.75rem;

      [dir=ltr] & {
        margin-left: auto;
        padding-right: 2rem;
      }

      [dir=rtl] & {
        margin-right: auto;
        padding-left: 2rem;
      }
    }
  }

  &__metadata {
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
    margin: 0.5rem -0.25rem;
    line-height: 1;
    font-size: 0.9em;

    li {
      display: flex;
      align-items: center;
      margin: 0.25rem;

      &:after {
        content: '◆';
        font-size: 0.8em;
        opacity: 0.7;

        [dir=ltr] & {
          margin: 0 0 0.125rem 0.4rem;
        }

        [dir=rtl] & {
          margin: 0 0.4rem 0.125rem 0;
        }
      }

      &:last-child:after {
        display: none;
      }
    }

    &-icon {
      flex-shrink: 0;

      [dir=ltr] & {
        margin-right: 0.25rem;
      }

      [dir=rtl] & {
        margin-left: 0.25rem;
      }
    }
  }

  &__date-help {
    display: flex;
    align-items: center;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    font-size: 1em;

    [dir=ltr] & {
      margin: 0 0 0 0.25rem;
    }

    [dir=rtl] & {
      margin: 0 0.25rem 0 0;
    }

    &:hover {
      color: #0f3562;
    }
  }

  &__text {
    transition: opacity 1s ease-out, transform 1s ease-out;
    transition-delay: 0.75s, 0.75s;
    max-width: 100%;
    opacity: 1;
    transform: translateY(0);
    position: relative;
    padding: 2rem 3rem 1rem;
    text-align: justify;
    line-height: 1.9;
  }

  &__title {
    font-variant: small-caps;
    font-size: 2em;
    margin: 0;
    line-height: normal;
    text-align: start;
  }

  &__read-more {
    display: block;
    text-align: center;
    border: 2px solid #0f3562;
    text-transform: uppercase;
    color: inherit;
    text-decoration: none;
    font-size: 1.2em;
    padding: 0.75rem 1rem;
    position: relative;
    border-radius: 3px;
    margin: 0 1rem;
    transition: all 0.3s ease-in-out;
    background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
    background-repeat: no-repeat;
    background-size: 100% 0 !important;
    background-position: 50% 100%;

    &:hover, &:active, &:focus {
      color: #f6f8fa;
      background-size: 100% 100% !important;
    }
  }

  &__share, &__related {
    transition: opacity 1s ease-out, transform 1s ease-out;
    transition-delay: 0.75s, 0.75s;
    max-width: 100%;
    opacity: 1;
    transform: translateY(0);
    padding: 1rem 2.5rem;

    h3 {
      font-size: 1.3em;
      width: 100%;
      flex-grow: 1;
      padding: 0 0.5rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }
  }

  &__share {
    text-align: center;

    h3 {
      text-align: left;
      margin-bottom: 0.5rem;
    }

    .share-button, &-more-button {
      &__icon {
        width: 1rem;
        height: 1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        .share-button__icon-img {
          display: block;
          width: 1rem;
          height: 1rem;
          // Logos are black in the SVG source; invert to display as white.
          filter: brightness(0) invert(1);
        }

        [dir=ltr] & {
          margin-right: 0.4rem;
        }

        [dir=rtl] & {
          margin-left: 0.4rem;
        }
      }

      &__text {
        font-size: 1em;
        margin-left: 0;
      }
    }

    .share-button {
      $focus-color: hsla(215, 5%, 54%, 0.4);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      height: 28px;
      padding: 0 0.5rem;
      margin: 4px;
      border-radius: 4px;
      text-decoration: none;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-weight: 400;
      line-height: 1;
      user-select: none;
      transition: filter 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      border: none;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
      background-image: none;
      text-rendering: auto;
      text-indent: 0;
      text-align: center;
      letter-spacing: normal;
      word-spacing: normal;
      text-shadow: none;

      svg {
        display: block;
      }

      &:not(:disabled):not(.disabled) {
        cursor: pointer;
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        box-shadow: 0 0 0 3px $focus-color;
      }

      &:hover {
        filter: brightness(0.92);
      }

      &:active {
        filter: brightness(0.86);
      }

      @media (max-width: 768px) {
        margin: 2px;
      }
    }

    .share-button--twitter {
      background-color: #000000;
    }

    .share-button--facebook {
      background-color: #0866FF;
    }

    .share-button--reddit {
      background-color: #FF4500;
    }

    .share-button--tumblr {
      background-color: #36465d;
    }

    .share-button--instagram {
      background-color: #FF0069;
    }

    .share-button--general {
      background-color: hsl(214, 5%, 29%);
    }

    &-more-button {
      $main-color: hsl(214, 5%, 29%);
      $focus-color: hsla(215, 5%, 54%, 0.4);
      $hover-color: hsla(215, 5%, 29%, 0.9);
      $painted-color: hsla(214, 4%, 19%, 1);
      display: inline-block;
      min-height: 28px;
      padding: 0.35rem 0.5rem;
      margin: 4px;
      color: #fff;
      background-color: $main-color;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-weight: 400;
      vertical-align: top;
      user-select: none;
      border: none;
      border-radius: 4px;
      box-shadow: none;
      text-rendering: auto;
      text-indent: 0;
      text-align: center;
      letter-spacing: normal;
      word-spacing: normal;
      text-shadow: none;
      transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;

      &:disabled {
        opacity: 0.9;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px $focus-color;
      }

      &:hover {
        background-color: $hover-color;
      }

      &:not(:disabled):not(.disabled) {
        cursor: pointer;
      }

      &:last-child {
        margin-right: 0;
      }

      @media (max-width: 768px) {
        margin: 2px;
      }
    }
  }

  &__related {
    &-group {
      display: flex;
      flex-wrap: wrap;
      max-width: 100%;
      margin-bottom: 0.5rem;

      &-title {
        text-transform: uppercase;
        font-size: 0.7em;
        flex-grow: 1;
        margin: 0.25rem 0.5rem;
        width: 100%;
      }
    }

    &-link {
      text-align: center;
      font-size: 1em;
      width: 115px;
      max-width: 100%;
      margin: 0.5rem;
      word-wrap: break-word;
      text-decoration: none;
      color: inherit;

      &-icon {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        clip-path: polygon(
            2rem 0,
            calc(100% - 2rem) 0,
            100% 2rem,
            100% calc(100% - 2rem),
            calc(100% - 2rem) 100%,
            2rem 100%,
            0 calc(100% - 2rem),
            0 2rem
        );
        transition: all 0.2s ease-in;
        margin-bottom: 0.5rem;

        &:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #ffad00;
          opacity: 0;
        }
      }

      &-image, &-placeholder {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background-color: #0f3562;
        background-repeat: no-repeat;
        background-size: 100%;
        transition: transform 0.2s linear;
      }

      &:hover, &:active, &:focus {
        .details__related-link-icon {
          transition: all 0.2s ease-out;
          clip-path: polygon(
              1rem 0,
              calc(100% - 1rem) 0,
              100% 1rem,
              100% calc(100% - 1rem),
              calc(100% - 1rem) 100%,
              1rem 100%,
              0 calc(100% - 1rem),
              0 1rem
          );

          &:after {
            opacity: 0.2;
          }
        }

        .details__related-link-image, .details__related-link-placeholder {
          transition-duration: 5s;
          transform: scale(2);
        }
      }
    }
  }

  &--image {
    .details__close {
      color: #F5ECDA;
    }

    .details__text {
      padding-top: 1rem;
    }
  }

  &__intersection-guard {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
  }
}
</style>
