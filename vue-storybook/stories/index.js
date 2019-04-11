import { storiesOf } from '@storybook/vue';

import Talkbox from '../../src/components/Talkbox.vue';
import MessageForm from '../../src/components/Talkbox.vue';

storiesOf('말풍선', module)
    .add('알림말', () => ({
        components: { Talkbox },
        template: '<Talkbox :notice="true">방이 개설 되었습니다.</Talkbox>'
    }))
    .add('지난대화말', () => ({
        components: { Talkbox },
        template: '<Talkbox :old="true">문 대통령은 이날...</Talkbox>'
    })) 
    .add('지난대화말 우측', () => ({
        components: { Talkbox },
        template: '<Talkbox  :right="true" :old="true">문 대통령은 이날...</Talkbox>'
    }))
    .add('짧은문맥', () => ({
        components: { Talkbox },
        template: '<Talkbox>문 대통령은 이날...</Talkbox>'
    }))   
    .add('좌측', () => ({
        components: { Talkbox },
        template: '<Talkbox>문 대통령은 이날 낮 12시 25분쯤 강원도 고성군·속초시·강릉시·동해시·인제군 등 5개 시군을 특별재난지역으로 선포한다는 정부 건의를 재가했다.</Talkbox>'
    }))    
    .add('우측', () => ({
        components: { Talkbox },
        template: '<Talkbox :right="true">문 대통령은 이날 낮 12시 25분쯤 강원도 고성군·속초시·강릉시·동해시·인제군 등 5개 시군을 특별재난지역으로 선포한다는 정부 건의를 재가했다.</Talkbox>'
    }));


storiesOf('메세지 입력폼', module)
    .add('일반', () => ({
        components: { MessageForm },
        template: '<MessageForm></MessageForm>'
    }));