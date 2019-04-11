<template>
    <div class="talkBox" :class="{ old: old, notice: notice, right: right }">
        <div class="wrap">
            <slot></slot>
        </div>        
    </div>
</template>

<script>
    export default {
        name: 'Talkbox',
        props: {
            old: {
                type: Boolean,
                default: false
            },
            notice: {
                type: Boolean,
                default: false
            },
            right: {
                type: Boolean,
                default: false
            }
        }
    }
</script>

<style>
    .talkBox {
        display: inline-block;
        position: relative;
        padding: 10px;
        margin-left: 10px;
        border-radius: 10px;
        border: solid 2px #448aff;
        font-size: 14px;
    }
    .talkBox .wrap{
        word-break: break-all;
    }
    .talkBox::before{
        content: '';
        position: absolute;
        left: -11px;
        top: 8px;
        width: 0px;
        height: 0px;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 9px solid #448aff;
    }
    .talkBox.right{
        margin-right: 10px;
    }
    .talkBox.right::before{
        content: '';
        position: absolute;
        left: inherit;
        right: -11px;        
        top: 8px;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 9px solid #448aff;
        border-right: 0;
    }                
    .talkBox.notice {
        width: 100%;
        position: absolute;
        top: 0;
        margin: 0;
        text-align: center;
        border-width: 1px;
        border-color: #e19c9c;
        background-color: rgba(255, 255, 255, .8);    
    }
    .talkBox.notice::before {
        display: none;
    }

    .old{
        color: #666;
        border-color: #ccc;        
    }
    .old::before{
        border-right-color: #ccc
    }
    .old.right{
        float: right;
        text-align: right;
    }
    .old.right::before{
        border-left-color: #ccc
    }
</style>